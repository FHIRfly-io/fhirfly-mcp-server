# FHIRfly MCP Server

> Healthcare reference data for AI assistants — drugs, providers, diagnoses, labs, vaccines, and claims intelligence from authoritative sources.

## Description

FHIRfly connects AI assistants to real-time healthcare reference data via 56 MCP tools. Instead of relying on training data that may be outdated or hallucinated, your AI can look up accurate information from authoritative government and standards bodies — FDA, CMS, NLM, CDC, SNOMED International, and NHS England.

Covers drug data (NDC, RxNorm, FDA Labels), provider data (NPI), clinical codes (ICD-10, LOINC, SNOMED CT, CVX/MVX), HCC risk adjustment mappings, UK NHS procedure codes (OPCS-4), UK dm+d medicines and devices (NHS), connectivity data (FHIR endpoints, SMA Endpoint Directory), and claims intelligence (NCCI edits, MUE limits, Medicare fee schedules, coverage determinations).

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
- HCC risk adjustment crosswalk — ICD-10 to HCC mappings (CMS, models V21/V22/V24/V28)
- OPCS-4 UK NHS procedure classification lookup and search (NHS England, OGL v3.0)
- dm+d UK Dictionary of Medicines and Devices lookup and search (NHS England / NHSBSA, OGL v3.0)
- UCUM unit code lookup, search, validation, and conversion (NLM/Regenstrief)
- RxClass drug classification lookup, search, and member listing (NLM MED-RT)
- HCPCS Level II procedure/supply code lookup and search (CMS)
- MS-DRG Diagnosis Related Group lookup and search (CMS)
- POS Place of Service code lookup (CMS)
- J-Code/NDC Crosswalk bidirectional HCPCS-to-NDC mapping (CMS)
- DDI Reference — multi-drug interaction check using FDA label text + RxNorm enrichment
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
- "Which states have implemented Medicaid FHIR endpoints?"

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
| `hcc_get` | Look up HCC risk adjustment mappings for an ICD-10 code |
| `hcc_reverse` | Find all ICD-10 codes mapping to a given HCC category |
| `hcc_search` | Search the HCC crosswalk by code, model, or category |
| `opcs4_get` | Look up an OPCS-4 UK NHS procedure code |
| `opcs4_search` | Search OPCS-4 procedure codes |
| `dmd_get` | Look up a UK dm+d medicine/device by SNOMED code |
| `dmd_search` | Search UK dm+d medicines and devices |
| `ucum_get` | Look up a UCUM unit code |
| `ucum_search` | Search units of measure |
| `ucum_validate` | Validate a UCUM expression |
| `ucum_convert` | Convert between UCUM units |
| `rxclass_get` | Look up a drug class by ID |
| `rxclass_search` | Search drug classifications |
| `rxclass_members` | List drugs in a class |
| `hcpcs_get` | Look up an HCPCS Level II code |
| `hcpcs_modifier_get` | Look up an HCPCS modifier |
| `hcpcs_search` | Search HCPCS codes |
| `msdrg_get` | Look up an MS-DRG code |
| `msdrg_search` | Search MS-DRG codes |
| `pos_get` | Look up a Place of Service code |
| `jcode_by_hcpcs` | Find NDCs for a J-code |
| `jcode_by_ndc` | Find HCPCS codes for an NDC |
| `check_drug_interactions` | Check drug-drug interactions for multiple drugs |

## Tags

healthcare, medical, fhir, drugs, ndc, npi, rxnorm, loinc, icd-10, snomed, fda, claims, terminology, clinical, medicare, vaccines, cvx, billing, interoperability, reference-data, medicaid, sma, hcc, risk-adjustment, opcs-4, nhs, dmd, ddi, drug-interactions, ucum, rxclass, hcpcs, msdrg, pos, jcode

## Documentation URL

https://fhirfly.io/docs/mcp
