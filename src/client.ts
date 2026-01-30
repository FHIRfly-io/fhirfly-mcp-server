/**
 * FHIRfly API Client
 * Makes HTTP requests to the FHIRfly MCP endpoint
 */

import type {
  JsonRpcRequest,
  JsonRpcResponse,
  McpServerConfig,
  McpToolsListResult,
  McpToolCallResult,
} from "./types.js";

export class FhirflyClient {
  private config: McpServerConfig;

  constructor(config: McpServerConfig) {
    this.config = config;
  }

  /**
   * Send a JSON-RPC request to the FHIRfly MCP endpoint
   */
  async request(method: string, params?: Record<string, unknown>): Promise<JsonRpcResponse> {
    const requestBody: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    };

    if (this.config.debug) {
      console.error(`[MCP DEBUG] API Request: ${method}`, params);
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
          "User-Agent": "@fhirfly-io/mcp-server",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 401) {
          return {
            jsonrpc: "2.0",
            id: requestBody.id,
            error: {
              code: -32001,
              message: "Authentication failed. Check your FHIRFLY_API_KEY.",
            },
          };
        }

        if (response.status === 429) {
          return {
            jsonrpc: "2.0",
            id: requestBody.id,
            error: {
              code: -32002,
              message: "Rate limit exceeded. Please slow down requests.",
            },
          };
        }

        return {
          jsonrpc: "2.0",
          id: requestBody.id,
          error: {
            code: -32000,
            message: `API error: ${response.status} ${response.statusText}`,
          },
        };
      }

      const result = (await response.json()) as JsonRpcResponse;

      if (this.config.debug) {
        console.error("[MCP DEBUG] API Response:", JSON.stringify(result, null, 2));
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (this.config.debug) {
        console.error("[MCP DEBUG] API Error:", message);
      }

      return {
        jsonrpc: "2.0",
        id: requestBody.id,
        error: {
          code: -32003,
          message: `Network error: ${message}`,
        },
      };
    }
  }

  /**
   * Get list of available tools from FHIRfly
   */
  async listTools(): Promise<McpToolsListResult> {
    const response = await this.request("tools/list", {});

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result as McpToolsListResult;
  }

  /**
   * Call a tool on the FHIRfly API
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<McpToolCallResult> {
    const response = await this.request("tools/call", {
      name,
      arguments: args,
    });

    if (response.error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: response.error.message,
              code: response.error.code,
            }),
          },
        ],
        isError: true,
      };
    }

    return response.result as McpToolCallResult;
  }
}
