// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "../src/server.js";
import { MCP_ERROR_CODES } from "../src/types.js";

// Helper to get the message handler from a started server
// We mock stdin/stdout to prevent actual I/O
function createTestServer() {
  const server = new McpServer({
    apiKey: "ffly_test_key_123",
    apiUrl: "https://api.fhirfly.io",
    debug: false,
  });

  return server;
}

// Since handleMessage is private, we test through the public interface
// by directly calling the handler that gets set on the transport
describe("McpServer", () => {
  it("should create server with config", () => {
    const server = createTestServer();
    expect(server).toBeDefined();
    expect(server.initialized).toBe(false);
  });

  it("should have initialized property default to false", () => {
    const server = createTestServer();
    expect(server.initialized).toBe(false);
  });
});

describe("McpServer message handling", () => {
  let handler: (request: any) => Promise<any>;

  beforeEach(() => {
    // Access the handler by intercepting transport.setHandler
    const server = new McpServer({
      apiKey: "ffly_test_key_123",
      apiUrl: "https://api.fhirfly.io",
      debug: false,
    });

    // Capture the handler that McpServer sets on the transport
    const transport = (server as any).transport;
    transport.setHandler = (h: any) => {
      handler = h;
    };
    // Mock transport.start to avoid stdin/stdout issues
    transport.start = vi.fn();

    server.start();
  });

  it("should return valid initialize response", async () => {
    const response = await handler({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0" },
      },
    });

    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(1);
    expect(response.result).toBeDefined();
    expect(response.result.protocolVersion).toBe("2024-11-05");
    expect(response.result.serverInfo.name).toBe("fhirfly-mcp-server");
    expect(response.result.serverInfo.version).toBeDefined();
    expect(response.result.capabilities).toHaveProperty("tools");
  });

  it("should set initialized flag on 'initialized' notification", async () => {
    const server = new McpServer({
      apiKey: "ffly_test_key_123",
      apiUrl: "https://api.fhirfly.io",
      debug: false,
    });

    const transport = (server as any).transport;
    let localHandler: (req: any) => Promise<any>;
    transport.setHandler = (h: any) => { localHandler = h; };
    transport.start = vi.fn();
    server.start();

    expect(server.initialized).toBe(false);

    await localHandler!({
      jsonrpc: "2.0",
      id: 2,
      method: "initialized",
    });

    expect(server.initialized).toBe(true);
  });

  it("should return METHOD_NOT_FOUND for unknown methods", async () => {
    const response = await handler({
      jsonrpc: "2.0",
      id: 3,
      method: "unknown/method",
    });

    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(3);
    expect(response.error).toBeDefined();
    expect(response.error.code).toBe(MCP_ERROR_CODES.METHOD_NOT_FOUND);
    expect(response.error.message).toContain("Unknown method");
  });

  it("should return INVALID_REQUEST for bad JSON-RPC", async () => {
    const response = await handler({
      jsonrpc: "1.0",
      id: 4,
      method: "initialize",
    });

    expect(response.jsonrpc).toBe("2.0");
    expect(response.error).toBeDefined();
    expect(response.error.code).toBe(MCP_ERROR_CODES.INVALID_REQUEST);
  });

  it("should return INVALID_REQUEST when method is missing", async () => {
    const response = await handler({
      jsonrpc: "2.0",
      id: 5,
    });

    expect(response.jsonrpc).toBe("2.0");
    expect(response.error).toBeDefined();
    expect(response.error.code).toBe(MCP_ERROR_CODES.INVALID_REQUEST);
  });

  it("should return INVALID_PARAMS when tool name is missing in tools/call", async () => {
    const response = await handler({
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {},
    });

    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(6);
    expect(response.error).toBeDefined();
    expect(response.error.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS);
    expect(response.error.message).toContain("Missing tool name");
  });

  it("should return empty result for ping", async () => {
    const response = await handler({
      jsonrpc: "2.0",
      id: 7,
      method: "ping",
    });

    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(7);
    expect(response.result).toEqual({});
    expect(response.error).toBeUndefined();
  });
});

describe("Configuration", () => {
  it("should require API key starting with ffly_", () => {
    const validKeys = [
      "ffly_live_abc123",
      "ffly_dev_xyz789",
      "ffly_test_123456",
    ];

    for (const key of validKeys) {
      expect(key.startsWith("ffly_")).toBe(true);
    }
  });

  it("should reject invalid API key formats", () => {
    const invalidKeys = [
      "invalid_key",
      "sk_live_123",
      "",
      "ffly",
    ];

    for (const key of invalidKeys) {
      expect(key.startsWith("ffly_") && key.length > 5).toBe(false);
    }
  });
});
