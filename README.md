# @fhirfly-io/mcp-server

MCP (Model Context Protocol) server for connecting Claude Desktop to [FHIRfly](https://fhirfly.io) healthcare reference data APIs.

## What is this?

This package lets Claude Desktop look up real healthcare reference data including:

- **NDC** - Drug products and packages (FDA)
- **NPI** - Healthcare provider identifiers (CMS)
- **RxNorm** - Drug terminology (NLM)
- **LOINC** - Laboratory codes (Regenstrief Institute)
- **ICD-10** - Diagnosis and procedure codes (CMS)
- **CVX/MVX** - Vaccine codes (CDC)
- **FDA Drug Labels** - Prescribing information
- **SNOMED CT** - Clinical concepts (IPS free set)
- **HCC** - CMS Hierarchical Condition Category risk adjustment mappings
- **OPCS-4** - UK NHS procedure classification codes
- **Connectivity** - Provider FHIR endpoints and Direct addresses
- **SMA** - State Medicaid Agency FHIR endpoint directory (CMS)
- **Claims Intelligence** - NCCI edits, MUE limits, PFS/RVU data, coverage determinations

When you ask Claude about medications, providers, or clinical codes, it can look up accurate, current information instead of relying on training data.

## Prerequisites

1. **Claude Desktop** - Download from [claude.ai/download](https://claude.ai/download)
2. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org)
3. **FHIRfly API Key** - Get one at [fhirfly.io](https://fhirfly.io) (free tier available)

## Quick Setup

### Step 1: Get a FHIRfly API Key

1. Go to [fhirfly.io](https://fhirfly.io) and sign up
2. Navigate to **Dashboard > Credentials**
3. Click **Create Credential** and select **MCP (Claude Desktop)**
4. Copy your API key (starts with `ffly_`)

### Step 2: Configure Claude Desktop

Find your Claude Desktop config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add the FHIRfly server configuration:

```json
{
  "mcpServers": {
    "fhirfly": {
      "command": "npx",
      "args": ["-y", "@fhirfly-io/mcp-server"],
      "env": {
        "FHIRFLY_API_KEY": "ffly_live_your_key_here"
      }
    }
  }
}
```

Replace `ffly_live_your_key_here` with your actual API key.

### Step 3: Restart Claude Desktop

Completely quit Claude Desktop and reopen it. The FHIRfly tools should now be available.

## Verify It Works

Try asking Claude:

- "What is NDC 0069-0151-01?"
- "Look up NPI 1234567893"
- "Search for COVID vaccines in the CVX database"
- "What are the drug interactions for Lipitor?"
- "Which states have implemented Medicaid FHIR endpoints?"
- "Show me the FHIR endpoint details for California's Medicaid program"

Claude should use the FHIRfly tools to look up real data.

## Available Tools

| Tool | Description |
|------|-------------|
| `ndc_get` | Look up drug by NDC code |
| `ndc_search` | Search drugs by name, ingredient, etc. |
| `npi_get` | Look up provider by NPI number |
| `npi_search` | Search providers by name, specialty, location |
| `rxnorm_get` | Look up drug by RxCUI |
| `rxnorm_search` | Search drug terminology |
| `loinc_get` | Look up lab test by LOINC code |
| `loinc_search` | Search lab codes |
| `icd10_get` | Look up diagnosis/procedure code |
| `icd10_search` | Search ICD-10 codes |
| `cvx_get` | Look up vaccine by CVX code |
| `cvx_search` | Search vaccine codes |
| `mvx_get` | Look up vaccine manufacturer |
| `mvx_search` | Search manufacturers |
| `fda_label_lookup` | Look up FDA drug label |
| `fda_label_search` | Search drug labels |
| `fda_label_safety` | Get safety info (boxed warnings, contraindications) |
| `fda_label_interactions` | Get drug interaction info |
| `fda_label_dosing` | Get dosing information |
| `fda_label_sections` | Get specific label sections |
| `snomed_get` | Look up clinical concept by SNOMED CT ID |
| `snomed_search` | Search SNOMED CT IPS concepts |
| `snomed_mappings` | Find cross-terminology mappings for a SNOMED concept |
| `npi_connectivity` | Look up provider connectivity (FHIR endpoints) |
| `sma_list_states` | List states with Medicaid FHIR endpoint status |
| `sma_get_state` | Get SMA FHIR endpoint details for a state |
| `sma_stats` | Get aggregate SMA implementation statistics |
| `ncci_validate` | Check if two codes can be billed together (NCCI) |
| `mue_lookup` | Look up max units of service (MUE limits) |
| `pfs_lookup` | Look up Medicare fee schedule / RVU data |
| `coverage_check` | Check LCD/NCD coverage determinations |
| **HCC / OPCS-4 Tools** | |
| `hcc_get` | Look up HCC risk adjustment mappings for an ICD-10 code |
| `hcc_reverse` | Find all ICD-10 codes mapping to a given HCC category |
| `hcc_search` | Search the HCC crosswalk by code, model, or category |
| `opcs4_get` | Look up an OPCS-4 UK NHS procedure code |
| `opcs4_search` | Search OPCS-4 procedure codes |
| **Batch Tools** | |
| `ndc_batch` | Look up multiple NDC codes (max 500) |
| `npi_batch` | Look up multiple NPI numbers (max 100) |
| `icd10_batch` | Look up multiple ICD-10 codes (max 100) |
| `rxnorm_batch` | Look up multiple RxCUIs (max 100) |
| `loinc_batch` | Look up multiple LOINC codes (max 100) |
| `cvx_batch` | Look up multiple CVX codes (max 100) |
| `mvx_batch` | Look up multiple MVX codes (max 100) |
| `fda_label_batch` | Look up multiple FDA labels (max 50) |

## Configuration Options

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `FHIRFLY_API_KEY` | Your FHIRfly API key (required) | - |
| `FHIRFLY_API_URL` | API base URL | `https://api.fhirfly.io` |
| `FHIRFLY_DEBUG` | Enable debug logging (`1` or `true`) | `false` |
| `FHIRFLY_TIMEOUT` | Fetch timeout in milliseconds | `30000` |

## Troubleshooting

### "FHIRFLY_API_KEY environment variable is required"

Your API key isn't configured. Make sure:
1. You have a valid API key from [fhirfly.io](https://fhirfly.io)
2. It's set in the `env` section of your Claude Desktop config
3. The key starts with `ffly_`

### "Invalid API key format"

FHIRfly API keys start with `ffly_`. Check that you copied the full key.

### "Authentication failed"

Your API key may be invalid or expired. Generate a new one at [fhirfly.io/dashboard/credentials](https://fhirfly.io/dashboard/credentials).

### Claude doesn't show FHIRfly tools

1. Make sure you completely quit and restarted Claude Desktop
2. Check your config file syntax (must be valid JSON)
3. Enable debug mode to see what's happening:

```json
{
  "mcpServers": {
    "fhirfly": {
      "command": "npx",
      "args": ["-y", "@fhirfly-io/mcp-server"],
      "env": {
        "FHIRFLY_API_KEY": "your_key",
        "FHIRFLY_DEBUG": "1"
      }
    }
  }
}
```

### "Rate limit exceeded"

You've hit your plan's rate limit. Wait a moment and try again, or upgrade your plan at [fhirfly.io](https://fhirfly.io).

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Claude Desktop │────▶│  This Package   │────▶│  FHIRfly API    │
│                 │     │  (runs locally) │     │  (cloud)        │
│  "What is       │◀────│                 │◀────│                 │
│   NDC 123..."   │     │  Translates MCP │     │  Returns drug   │
│                 │     │  ↔ HTTPS        │     │  data           │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

This package runs on your computer as a bridge between Claude Desktop and the FHIRfly API. It:

1. Receives requests from Claude Desktop via stdin
2. Translates them to HTTPS requests to FHIRfly
3. Returns the results to Claude via stdout

Your API key is sent to FHIRfly over HTTPS. No healthcare data is stored locally.

## Links

- [FHIRfly Documentation](https://fhirfly.io/docs)
- [MCP Setup Guide](https://fhirfly.io/docs/mcp/claude-desktop)
- [Get an API Key](https://fhirfly.io)
- [Report Issues](https://gitlab.com/fhirfly-io/fhirfly-mcp-server/-/issues)

## Data Sources & Licensing

| Data Source | Provider | License |
|-------------|----------|---------|
| NDC Directory | FDA | Public domain |
| NPPES (NPI) | CMS | Public domain |
| RxNorm | NLM (NIH) | UMLS license (free) |
| LOINC | Regenstrief Institute | Free with attribution |
| ICD-10-CM/PCS | CMS | Public domain |
| CVX/MVX | CDC | Public domain |
| FDA Drug Labels | FDA/openFDA | Public domain |
| SNOMED CT IPS | SNOMED International | CC BY 4.0 |
| HCC Crosswalk | CMS | Public domain |
| OPCS-4 | NHS England | OGL v3.0 (Crown copyright) |
| SMA Endpoint Directory | CMS | Public domain |
| NCCI/MUE/PFS | CMS | Public domain |

FHIRfly aggregates and indexes these data sources. See [fhirfly.io/docs](https://fhirfly.io/docs) for details.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.

## License

MIT - see [LICENSE](./LICENSE)
