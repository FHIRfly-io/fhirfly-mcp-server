/**
 * FHIRfly MCP Server
 *
 * MCP (Model Context Protocol) server for connecting Claude Desktop
 * to FHIRfly healthcare reference data APIs.
 *
 * @example
 * // Claude Desktop configuration (claude_desktop_config.json):
 * {
 *   "mcpServers": {
 *     "fhirfly": {
 *       "command": "npx",
 *       "args": ["-y", "@fhirfly-io/mcp-server"],
 *       "env": {
 *         "FHIRFLY_API_KEY": "your_api_key_here"
 *       }
 *     }
 *   }
 * }
 *
 * @packageDocumentation
 */

export { McpServer } from "./server.js";
export { FhirflyClient } from "./client.js";
export { StdioTransport } from "./transport.js";
export type {
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcError,
  McpToolDefinition,
  McpToolsListResult,
  McpToolCallParams,
  McpToolCallResult,
  McpServerConfig,
} from "./types.js";
