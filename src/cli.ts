// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
/**
 * FHIRfly MCP Server CLI
 * Entry point for running as an MCP server
 */

import { McpServer } from "./server.js";
import { VERSION } from "./version.js";

// Handle --version and --help flags (before config validation)
const args = process.argv.slice(2);
if (args.includes("--version") || args.includes("-v")) {
  console.log(VERSION);
  process.exit(0);
}
if (args.includes("--help") || args.includes("-h")) {
  console.log(`@fhirfly-io/mcp-server v${VERSION}`);
  console.log("");
  console.log("MCP server for connecting AI assistants to FHIRfly healthcare data.");
  console.log("");
  console.log("Environment variables:");
  console.log("  FHIRFLY_API_KEY   Your FHIRfly API key (required, starts with ffly_)");
  console.log("  FHIRFLY_API_URL   API base URL (default: https://api.fhirfly.io)");
  console.log("  FHIRFLY_DEBUG     Enable debug logging (set to 1 or true)");
  console.log("  FHIRFLY_TIMEOUT   Fetch timeout in milliseconds (default: 30000)");
  console.log("");
  console.log("Usage with Claude Desktop:");
  console.log('  npx @fhirfly-io/mcp-server');
  console.log("");
  console.log("Flags:");
  console.log("  --version, -v     Show version number");
  console.log("  --help, -h        Show this help message");
  process.exit(0);
}

// Configuration from environment
const API_KEY = process.env.FHIRFLY_API_KEY;
const API_URL = process.env.FHIRFLY_API_URL || "https://api.fhirfly.io";
const DEBUG = process.env.FHIRFLY_DEBUG === "1" || process.env.FHIRFLY_DEBUG === "true";
const TIMEOUT = process.env.FHIRFLY_TIMEOUT ? parseInt(process.env.FHIRFLY_TIMEOUT, 10) : undefined;

// Validate required configuration
if (!API_KEY) {
  console.error("Error: FHIRFLY_API_KEY environment variable is required");
  console.error("");
  console.error("To get an API key:");
  console.error("  1. Sign up at https://fhirfly.io");
  console.error("  2. Go to Dashboard > Credentials");
  console.error("  3. Create an MCP credential");
  console.error("");
  console.error("Then set the environment variable:");
  console.error('  export FHIRFLY_API_KEY="your_api_key_here"');
  console.error("");
  console.error("Or configure in Claude Desktop's claude_desktop_config.json");
  process.exit(1);
}

// Validate API key format
if (!API_KEY.startsWith("ffly_")) {
  console.error("Error: Invalid API key format");
  console.error("FHIRfly API keys start with 'ffly_'");
  console.error("");
  console.error("Please check your FHIRFLY_API_KEY environment variable.");
  process.exit(1);
}

if (DEBUG) {
  console.error("=".repeat(50));
  console.error("FHIRfly MCP Server - Debug Mode");
  console.error("=".repeat(50));
  console.error("API URL:", API_URL);
  console.error("API Key:", API_KEY.slice(0, 10) + "...");
  console.error("=".repeat(50));
}

// Create and start server
const server = new McpServer({
  apiKey: API_KEY,
  apiUrl: API_URL,
  debug: DEBUG,
  timeout: TIMEOUT,
});

server.start();
