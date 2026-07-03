#!/usr/bin/env bash
set -euo pipefail

DEFAULT_BRANCH="${DEFAULT_BRANCH:-main}"
REMOTE="${REMOTE:-origin}"

# --- MCP registry publishing config (used by: ./release.sh registry) ---
# The io.fhirfly namespace is DNS-verified; publishing signs with an ed25519
# key stored (as a PEM) in AWS Secrets Manager. Kept local (not in CI) so the
# signing key never has to live as a GitHub secret.
REGISTRY_SECRET_ID="${MCP_REGISTRY_SECRET_ID:-mcp-registry/fhirfly-io-key}"
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_PROFILE="${AWS_PROFILE:-bluraven_sls}"; export AWS_PROFILE
MCP_DOMAIN="${MCP_DOMAIN:-fhirfly.io}"
MCP_PUBLISHER_VERSION="${MCP_PUBLISHER_VERSION:-v1.7.9}"
MCP_PUBLISHER_BIN=""

die() { echo "Error: $*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

is_clean_tree() {
  [[ -z "$(git status --porcelain)" ]]
}

prompt() {
  # prompt "Message" "default"
  local msg="$1"
  local def="${2:-}"
  local input=""
  if [[ -n "$def" ]]; then
    read -r -p "$msg [$def]: " input
    echo "${input:-$def}"
  else
    read -r -p "$msg: " input
    echo "$input"
  fi
}

valid_semver() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

inc_patch() {
  local v="$1"
  IFS='.' read -r major minor patch <<<"$v"
  patch=$((patch + 1))
  echo "${major}.${minor}.${patch}"
}

# Highest vX.Y.Z tag (ignores pre-releases)
highest_semver_tag() {
  # list tags like v1.2.3, strip v, sort semver, return highest
  git tag -l 'v[0-9]*.[0-9]*.[0-9]*' \
    | sed 's/^v//' \
    | sort -V \
    | tail -n 1
}

pkg_version() {
  node -p "require('./package.json').version"
}

# Download mcp-publisher (prebuilt release binary) into a per-version temp cache
# and set MCP_PUBLISHER_BIN. Uses an existing on-PATH binary if present.
ensure_mcp_publisher() {
  if command -v mcp-publisher >/dev/null 2>&1; then
    MCP_PUBLISHER_BIN="$(command -v mcp-publisher)"
    return
  fi
  local os arch cache url
  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  case "$(uname -m)" in
    arm64|aarch64) arch="arm64" ;;
    x86_64|amd64)  arch="amd64" ;;
    *) die "Unsupported architecture for mcp-publisher: $(uname -m)" ;;
  esac
  cache="${TMPDIR:-/tmp}/mcp-publisher-${MCP_PUBLISHER_VERSION}"
  MCP_PUBLISHER_BIN="$cache/mcp-publisher"
  [[ -x "$MCP_PUBLISHER_BIN" ]] && return
  mkdir -p "$cache"
  url="https://github.com/modelcontextprotocol/registry/releases/download/${MCP_PUBLISHER_VERSION}/mcp-publisher_${os}_${arch}.tar.gz"
  echo "==> Downloading mcp-publisher ${MCP_PUBLISHER_VERSION} ($os/$arch)..."
  curl -sSL "$url" -o "$cache/mcp-publisher.tar.gz" || die "Failed to download mcp-publisher"
  tar xzf "$cache/mcp-publisher.tar.gz" -C "$cache" || die "Failed to extract mcp-publisher"
  [[ -x "$MCP_PUBLISHER_BIN" ]] || die "mcp-publisher binary missing after extract"
}

# Publish the current server.json to the official MCP registry. Run AFTER the
# GitHub release has published the matching npm version (the registry validates
# that npm identifier@version exists).
publish_registry() {
  require_cmd git; require_cmd node; require_cmd npm
  require_cmd aws;  require_cmd python3; require_cmd curl; require_cmd tar
  [[ -f server.json ]] || die "server.json not found (run from the mcp-server repo root)."

  local version identifier
  version="$(node -p "require('./server.json').version")"
  identifier="$(node -p "require('./server.json').packages[0].identifier")"
  echo "==> Registry publish for ${identifier}@${version}"

  # The registry rejects a publish whose npm version isn't live yet, so wait.
  echo "==> Waiting for npm to show ${identifier}@${version} (draft the GitHub release if you haven't)..."
  local waited=0
  until npm view "${identifier}@${version}" version >/dev/null 2>&1; do
    (( waited >= 300 )) && die "npm has no ${identifier}@${version} after 5 min. Publish the GitHub release, then re-run: ./release.sh registry"
    sleep 15; waited=$((waited + 15)); echo "   ...still waiting (${waited}s)"
  done
  echo "==> npm has ${identifier}@${version} ✓"

  ensure_mcp_publisher

  # Fetch the ed25519 DNS key (PEM) and reduce it to the 32-byte hex seed that
  # mcp-publisher expects. Written to a 600-perm temp file, removed on return.
  local seedfile
  seedfile="$(mktemp)"; chmod 600 "$seedfile"
  trap 'rm -f "$seedfile"' RETURN
  aws secretsmanager get-secret-value --secret-id "$REGISTRY_SECRET_ID" \
      --region "$AWS_REGION" --query 'SecretString' --output text 2>/dev/null \
    | python3 -c "
import sys, re, base64, binascii
raw = sys.stdin.read()
body = ''.join(re.sub(r'-----[A-Z ]+-----', '', raw).split())  # strip PEM armor lines
der = base64.b64decode(body)          # ed25519 PKCS8 = 16-byte prefix + 32-byte seed
open('$seedfile','w').write(binascii.hexlify(der[-32:]).decode())
" || die "Failed to load/convert the registry key from '$REGISTRY_SECRET_ID'"
  [[ -s "$seedfile" ]] || die "Empty seed after key conversion."

  echo "==> Logging in to the MCP registry (dns: $MCP_DOMAIN)..."
  "$MCP_PUBLISHER_BIN" login dns --domain "$MCP_DOMAIN" --private-key "$(cat "$seedfile")" \
    || die "mcp-publisher login failed"

  echo "==> Publishing ${identifier}@${version}..."
  "$MCP_PUBLISHER_BIN" publish || die "mcp-publisher publish failed"

  echo "==> Verifying registry latest version..."
  curl -s "https://registry.modelcontextprotocol.io/v0/servers?search=${identifier}" \
    | python3 -c "
import sys, json
d = json.load(sys.stdin)
for s in d.get('servers', []):
    srv = s.get('server', s)
    meta = (s.get('_meta') or {}).get('io.modelcontextprotocol.registry/official', {})
    if srv.get('name') == '${identifier}' and meta.get('isLatest'):
        print('   registry latest =', srv.get('version'))
" || true
  echo "✅ Registry publish complete for ${identifier}@${version}"
}

main() {
  require_cmd git
  require_cmd npm
  require_cmd node
  require_cmd sed
  require_cmd sort

  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "Not inside a git repository."

  echo "==> Fetching latest from $REMOTE (including tags)..."
  git fetch "$REMOTE" --tags --prune --force

  # Safety: clean working tree
  if ! is_clean_tree; then
    echo "Working tree status:"
    git status --porcelain
    die "Working tree is not clean. Commit/stash your changes before releasing."
  fi

  # Safety: correct branch
  local current_branch
  current_branch="$(git rev-parse --abbrev-ref HEAD)"
  [[ "$current_branch" == "$DEFAULT_BRANCH" ]] || die "You are on '$current_branch' but expected '$DEFAULT_BRANCH'."

  # Safety: up-to-date with remote (no divergence)
  local local_sha remote_sha
  local_sha="$(git rev-parse HEAD)"
  remote_sha="$(git rev-parse "$REMOTE/$DEFAULT_BRANCH")"
  [[ "$local_sha" == "$remote_sha" ]] || die "Local '$DEFAULT_BRANCH' is not aligned with $REMOTE/$DEFAULT_BRANCH. Run: git pull --ff-only $REMOTE $DEFAULT_BRANCH"

  # Determine suggested next version
  local last_tag last_pkg suggested
  last_tag="$(highest_semver_tag || true)"
  last_pkg="$(pkg_version)"

  if [[ -n "$last_tag" ]]; then
    suggested="$(inc_patch "$last_tag")"
    echo "==> Highest semver tag found: v$last_tag"
  else
    # no tags yet: use package.json as base
    if ! valid_semver "$last_pkg"; then
      die "package.json version '$last_pkg' isn't plain semver (X.Y.Z)."
    fi
    suggested="$(inc_patch "$last_pkg")"
    echo "==> No semver tags found. Using package.json version as base: $last_pkg"
  fi

  echo "==> Suggested next version: $suggested (tag: v$suggested)"
  local version
  version="$(prompt "Press Enter to accept, or type a different version" "$suggested")"

  valid_semver "$version" || die "Version must look like X.Y.Z (e.g., 0.1.5). Got: '$version'"

  local tag="v$version"

  # Safety: tag must not already exist locally or remotely
  if git rev-parse "$tag" >/dev/null 2>&1; then
    die "Tag '$tag' already exists locally."
  fi
  if git ls-remote --tags "$REMOTE" | grep -q "refs/tags/$tag$"; then
    die "Tag '$tag' already exists on $REMOTE."
  fi

  echo
  echo "About to release:"
  echo "  Branch : $DEFAULT_BRANCH"
  echo "  Version: $version"
  echo "  Tag    : $tag"
  echo

  local ok
  ok="$(prompt "Type 'yes' to proceed" "no")"
  [[ "$ok" == "yes" ]] || die "Aborted."

  echo "==> Bumping version in package.json (no git tag)..."
  npm version "$version" --no-git-tag-version

  # Verify package.json updated
  local new_pkg
  new_pkg="$(pkg_version)"
  [[ "$new_pkg" == "$version" ]] || die "package.json version is '$new_pkg' after bump, expected '$version'."

  # Sync version.ts with the new version
  if [[ -f src/version.ts ]]; then
    echo "==> Syncing src/version.ts to $version..."
    sed -i '' "s/export const VERSION = \".*\"/export const VERSION = \"$version\"/" src/version.ts
    git add src/version.ts
  fi

  # Sync server.json (MCP registry manifest) — both the top-level version and
  # each package version — so ./release.sh registry publishes the right release.
  if [[ -f server.json ]]; then
    echo "==> Syncing server.json to $version..."
    node -e '
      const fs = require("fs");
      const v = process.argv[1];
      const s = JSON.parse(fs.readFileSync("server.json", "utf8"));
      s.version = v;
      if (Array.isArray(s.packages)) for (const p of s.packages) if ("version" in p) p.version = v;
      fs.writeFileSync("server.json", JSON.stringify(s, null, 2) + "\n");
    ' "$version"
    git add server.json
  fi

  echo "==> Committing version bump..."
  git add package.json
  [[ -f package-lock.json ]] && git add package-lock.json
  [[ -f npm-shrinkwrap.json ]] && git add npm-shrinkwrap.json

  git diff --cached --quiet && die "No staged changes after bump; refusing to create empty commit."

  git commit -m "chore(release): $version"

  echo "==> Pushing '$DEFAULT_BRANCH' to $REMOTE..."
  git push "$REMOTE" "$DEFAULT_BRANCH"

  echo "==> Creating tag '$tag'..."
  git tag "$tag"

  echo "==> Pushing tag '$tag' to $REMOTE..."
  git push "$REMOTE" "$tag"

  echo
  echo "✅ Done: pushed version bump + tag $tag"
  echo
  echo "Next: Go to GitHub → Releases → Draft a new release"
  echo "  - Tag: $tag"
  echo "  - Target: $DEFAULT_BRANCH"
  echo "  - Publish the release (this should trigger npm publish via OIDC)"
  echo
  echo "Then update the MCP registry (once npm shows $version live):"
  echo "  ./release.sh registry"
  echo
  echo "Sanity check (tagged package.json):"
  echo "  git show $tag:package.json | head -n 20"
}

case "${1:-}" in
  registry) publish_registry ;;
  *)        main "$@" ;;
esac

