# Changelog

All notable changes to this project will be documented in this file.

## [0.6.0] - 2026-03-17

### Added
- HCC risk adjustment tools: `hcc_get`, `hcc_reverse`, `hcc_search` (CMS ICD-10 to HCC crosswalk, models V21/V22/V24/V28)
- OPCS-4 procedure tools: `opcs4_get`, `opcs4_search` (UK NHS procedure classification, OGL v3.0)
- Total tools increased from 39 to 44

## [0.5.0] - 2026-03-10

### Added
- 8 batch lookup tools: `ndc_batch`, `npi_batch`, `icd10_batch`, `rxnorm_batch`, `loinc_batch`, `cvx_batch`, `mvx_batch`, `fda_label_batch`
- Total tools increased from 31 to 39

## [0.2.3] - 2026-03-03

### Added
- Fetch timeout with `AbortSignal.timeout()` (default 30s, configurable via `McpServerConfig.timeout`)
- Rate-limit retry tests: successful retry, Retry-After header, max retries, non-retryable errors, timeout abort
- `release.sh` now auto-syncs `src/version.ts` with `package.json` version

### Fixed
- `src/version.ts` now matches `package.json` (was stuck at 0.2.0 since v0.2.1)

## [0.2.2] - 2026-02-28

### Fixed
- Corrected `server.json` schema for MCP registry compliance

### Added
- MCP registry metadata (`server.json`)

## [0.2.1] - 2026-02-25

### Changed
- Migrated repository URLs from GitHub to GitLab

## [0.2.0] - 2026-02-23

### Added
- Claims Intelligence tools: `ncci_validate`, `mue_lookup`, `pfs_lookup`, `coverage_check`
- SNOMED CT tools: `snomed_get`, `snomed_search`, `snomed_mappings`
- Connectivity tool: `npi_connectivity`
- `--version` / `-v` and `--help` / `-h` CLI flags
- Single retry on HTTP 429 with `Retry-After` header parsing
- Monotonically incrementing request IDs (replaces `Date.now()`)
- `VERSION` export from package entry point
- Behavioral test suite for server message handling
- Client test suite with mocked fetch
- Node.js 18/20/22 CI test matrix
- Data Sources & Licensing section in README
- This changelog

### Fixed
- Deduplicated MCP error codes (was defined in both `server.ts` and `types.ts`)
- Server version now tracks package version via `version.ts`
- Debug mode API key logging capped to 10 characters (was 15)

### Changed
- Total available tools: 20 → 28

## [0.1.7] - 2026-02-21

### Added
- Initial public release
- 20 MCP tools (NDC, NPI, RxNorm, LOINC, ICD-10, CVX, MVX, FDA Labels)
- Claude Desktop integration via stdio transport
- Debug mode via `FHIRFLY_DEBUG` environment variable

[0.6.0]: https://github.com/FHIRfly-io/fhirfly-mcp-server/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/FHIRfly-io/fhirfly-mcp-server/compare/v0.2.3...v0.5.0
[0.2.3]: https://gitlab.com/fhirfly-io/fhirfly-mcp-server/-/compare/v0.2.2...v0.2.3
[0.2.2]: https://gitlab.com/fhirfly-io/fhirfly-mcp-server/-/compare/v0.2.1...v0.2.2
[0.2.1]: https://gitlab.com/fhirfly-io/fhirfly-mcp-server/-/compare/v0.2.0...v0.2.1
[0.2.0]: https://gitlab.com/fhirfly-io/fhirfly-mcp-server/-/compare/v0.1.7...v0.2.0
[0.1.7]: https://gitlab.com/fhirfly-io/fhirfly-mcp-server/-/releases/v0.1.7
