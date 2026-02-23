# Changelog

All notable changes to this project will be documented in this file.

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

[0.2.0]: https://github.com/FHIRfly-io/fhirfly-mcp-server/compare/v0.1.7...v0.2.0
[0.1.7]: https://github.com/FHIRfly-io/fhirfly-mcp-server/releases/tag/v0.1.7
