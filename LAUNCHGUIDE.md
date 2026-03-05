# FHIRfly MCP Server

> Healthcare reference data for AI assistants — drugs, providers, diagnoses, labs, vaccines, and claims intelligence from authoritative sources.

## Description

FHIRfly connects AI assistants to real-time healthcare reference data via 31 MCP tools. Instead of relying on training data that may be outdated or hallucinated, your AI can look up accurate information from authoritative government and standards bodies — FDA, CMS, NLM, CDC, and SNOMED International.

Covers drug data (NDC, RxNorm, FDA Labels), provider data (NPI), clinical codes (ICD-10, LOINC, SNOMED CT, CVX/MVX), connectivity data (FHIR endpoints, SMA Endpoint Directory), and claims intelligence (NCCI edits, MUE limits, Medicare fee schedules, coverage determinations).

Zero runtime dependencies. Runs locally as a stdio bridge. Your API key never leaves your machine except over HTTPS to FHIRfly's API.

## Setup Requirements

| Variable | Description | Required |
|----------|-------------|----------|
| `FHIRFLY_API_KEY` | API key for FHIRfly (free tier available). Sign up at [fhirfly.io](https://fhirfly.io) | Yes |

## Category

Healthcare

## Features

- NDC drug lookup and search (FDA National Drug Code Directory)
- RxNorm terminology search and lookup (NLM/NIH)
- FDA Drug Labels — full prescribing info, safety warnings, interactions, dosing
- NPI provider lookup and search (CMS NPPES registry)
- Provider FHIR endpoint connectivity data
- State Medicaid Agency (SMA) FHIR endpoint directory (CMS)
- ICD-10-CM/PCS diagnosis and procedure code lookup and search
- LOINC lab test code lookup and search (Regenstrief Institute)
- SNOMED CT clinical concept lookup and search (IPS free set)
- SNOMED CT cross-terminology mappings (ICD-10, LOINC)
- CVX vaccine code lookup and search (CDC)
- MVX vaccine manufacturer lookup and search (CDC)
- NCCI Procedure-to-Procedure edit validation (billing compliance)
- Medically Unlikely Edits (MUE) service limit lookup
- Medicare Physician Fee Schedule / RVU data lookup
- LCD/NCD coverage determination checks
- Real-time data from authoritative sources (FDA, CMS, NLM, CDC, SNOMED International)
- Daily data updates — not stale snapshots
- Zero runtime dependencies
- Configurable request timeout
- Built-in rate-limit retry with backoff

## Getting Started

Install and run with npx:

```bash
npx @fhirfly-io/mcp-server
```

### Example Prompts

- "What is NDC 0069-0151-01?"
- "Look up NPI 1234567893"
- "Search for COVID vaccines in the CVX database"
- "What are the drug interactions for Lipitor?"
- "Can CPT codes 99213 and 99214 be billed together?"
- "What's the Medicare RVU for CPT 99213?"
- "Find the LOINC code for hemoglobin A1c"
- "What does ICD-10 code J06.9 mean?"
- "Show me the FDA label safety warnings for metformin"
- "Check if there's a national coverage determination for CGM devices"

### Tools

| Tool | Description |
|------|-------------|
| `ndc_get` | Look up a drug by NDC code |
| `ndc_search` | Search drugs by name or attributes |
| `npi_get` | Look up a provider by NPI number |
| `npi_search` | Search providers by name, specialty, location |
| `rxnorm_get` | Look up a drug concept by RxCUI |
| `rxnorm_search` | Search RxNorm drug terminology |
| `loinc_get` | Look up a lab test by LOINC code |
| `loinc_search` | Search LOINC lab test codes |
| `icd10_get` | Look up a diagnosis by ICD-10 code |
| `icd10_search` | Search ICD-10 diagnosis codes |
| `cvx_get` | Look up a vaccine by CVX code |
| `cvx_search` | Search vaccine codes |
| `mvx_get` | Look up a vaccine manufacturer by MVX code |
| `mvx_search` | Search vaccine manufacturers |
| `fda_label_lookup` | Look up an FDA drug label |
| `fda_label_search` | Search FDA drug labels |
| `fda_label_safety` | Get safety warnings from FDA labels |
| `fda_label_interactions` | Get drug interaction data from FDA labels |
| `fda_label_dosing` | Get dosing information from FDA labels |
| `fda_label_sections` | Get specific sections from FDA labels |
| `snomed_get` | Look up a SNOMED CT concept |
| `snomed_search` | Search SNOMED CT clinical terms |
| `snomed_mappings` | Get cross-terminology mappings for a SNOMED concept |
| `npi_connectivity` | Check a provider's FHIR endpoint connectivity |
| `sma_list_states` | List states with Medicaid FHIR endpoint implementation status |
| `sma_get_state` | Get full SMA FHIR endpoint details for a specific state |
| `sma_stats` | Get aggregate SMA implementation statistics |
| `ncci_validate` | Validate CPT code pair for NCCI billing edits |
| `mue_lookup` | Look up Medically Unlikely Edit limits for a CPT code |
| `pfs_lookup` | Look up Medicare Physician Fee Schedule / RVU data |
| `coverage_check` | Check LCD/NCD coverage determinations |

## Tags

healthcare, medical, fhir, drugs, ndc, npi, rxnorm, loinc, icd-10, snomed, fda, claims, terminology, clinical, medicare, vaccines, cvx, billing, interoperability, reference-data, medicaid, sma

## Documentation URL

https://fhirfly.io/docs/mcp
