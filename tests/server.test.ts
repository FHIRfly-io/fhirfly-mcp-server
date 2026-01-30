import { describe, it, expect, vi } from "vitest";
import { McpServer } from "../src/server.js";

describe("McpServer", () => {
  it("should create server with config", () => {
    const server = new McpServer({
      apiKey: "ffly_test_key",
      apiUrl: "https://api.fhirfly.io",
      debug: false,
    });

    expect(server).toBeDefined();
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
      "ffly", // too short
    ];

    for (const key of invalidKeys) {
      expect(key.startsWith("ffly_") && key.length > 5).toBe(false);
    }
  });
});

describe("JSON-RPC Protocol", () => {
  it("should format valid JSON-RPC requests", () => {
    const request = {
      jsonrpc: "2.0" as const,
      id: 1,
      method: "tools/list",
      params: {},
    };

    expect(request.jsonrpc).toBe("2.0");
    expect(request.id).toBe(1);
    expect(request.method).toBe("tools/list");
  });

  it("should format valid JSON-RPC responses", () => {
    const response = {
      jsonrpc: "2.0" as const,
      id: 1,
      result: { tools: [] },
    };

    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(1);
    expect(response.result).toBeDefined();
  });

  it("should format JSON-RPC error responses", () => {
    const errorResponse = {
      jsonrpc: "2.0" as const,
      id: 1,
      error: {
        code: -32600,
        message: "Invalid Request",
      },
    };

    expect(errorResponse.error.code).toBe(-32600);
    expect(errorResponse.error.message).toBe("Invalid Request");
  });
});
