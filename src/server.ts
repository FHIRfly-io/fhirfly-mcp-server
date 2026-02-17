/**
 * FHIRfly MCP Server
 * Main server class that handles MCP protocol messages
 */

import { StdioTransport } from "./transport.js";
import { FhirflyClient } from "./client.js";
import type {
  JsonRpcRequest,
  JsonRpcResponse,
  McpServerConfig,
  McpToolCallParams,
} from "./types.js";

const MCP_ERRORS = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;

// Server capabilities
const SERVER_INFO = {
  name: "fhirfly-mcp-server",
  version: "0.1.0",
};

const SERVER_CAPABILITIES = {
  tools: {},
};

export class McpServer {
  private transport: StdioTransport;
  private client: FhirflyClient;
  private config: McpServerConfig;
  public initialized: boolean = false;

  constructor(config: McpServerConfig) {
    this.config = config;
    this.transport = new StdioTransport(config.debug);
    this.client = new FhirflyClient(config);
  }

  /**
   * Start the MCP server
   */
  start(): void {
    if (this.config.debug) {
      console.error("[MCP DEBUG] Starting FHIRfly MCP Server");
      console.error("[MCP DEBUG] API URL:", this.config.apiUrl);
      console.error("[MCP DEBUG] API Key:", this.config.apiKey.slice(0, 10) + "...");
    }

    this.transport.setHandler(this.handleMessage.bind(this));
    this.transport.start();
  }

  /**
   * Handle incoming JSON-RPC messages
   */
  private async handleMessage(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    try {
      // Validate JSON-RPC request structure
      if (request.jsonrpc !== "2.0" || !request.method) {
        return {
          jsonrpc: "2.0",
          id: request.id ?? null,
          error: {
            code: MCP_ERRORS.INVALID_REQUEST,
            message: "Invalid JSON-RPC request",
          },
        };
      }

      // Route to appropriate handler
      switch (request.method) {
        case "initialize":
          return this.handleInitialize(request);

        case "initialized":
          // Client notification that initialization is complete
          this.initialized = true;
          return {
            jsonrpc: "2.0",
            id: request.id,
            result: {},
          };

        case "tools/list":
          return this.handleToolsList(request);

        case "tools/call":
          return this.handleToolsCall(request);

        case "ping":
          return {
            jsonrpc: "2.0",
            id: request.id,
            result: {},
          };

        default:
          return {
            jsonrpc: "2.0",
            id: request.id,
            error: {
              code: MCP_ERRORS.METHOD_NOT_FOUND,
              message: `Unknown method: ${request.method}`,
            },
          };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (this.config.debug) {
        console.error("[MCP DEBUG] Handler error:", message);
      }

      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: MCP_ERRORS.INTERNAL_ERROR,
          message: `Internal error: ${message}`,
        },
      };
    }
  }

  /**
   * Handle initialize request
   */
  private async handleInitialize(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    if (this.config.debug) {
      console.error("[MCP DEBUG] Initialize request from client");
    }

    return {
      jsonrpc: "2.0",
      id: request.id,
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: SERVER_INFO,
        capabilities: SERVER_CAPABILITIES,
      },
    };
  }

  /**
   * Handle tools/list request
   */
  private async handleToolsList(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    try {
      const result = await this.client.listTools();

      return {
        jsonrpc: "2.0",
        id: request.id,
        result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: MCP_ERRORS.INTERNAL_ERROR,
          message: `Failed to list tools: ${message}`,
        },
      };
    }
  }

  /**
   * Handle tools/call request
   */
  private async handleToolsCall(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const params = request.params as McpToolCallParams | undefined;

    if (!params?.name) {
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: MCP_ERRORS.INVALID_PARAMS,
          message: "Missing tool name in params",
        },
      };
    }

    try {
      const result = await this.client.callTool(params.name, params.arguments ?? {});

      return {
        jsonrpc: "2.0",
        id: request.id,
        result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: MCP_ERRORS.INTERNAL_ERROR,
          message: `Tool call failed: ${message}`,
        },
      };
    }
  }
}
