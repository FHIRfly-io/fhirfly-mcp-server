// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FhirflyClient } from "../src/client.js";
import type { McpServerConfig } from "../src/types.js";

const TEST_CONFIG: McpServerConfig = {
  apiKey: "ffly_test_key_123",
  apiUrl: "https://api.fhirfly.io",
  debug: false,
};

describe("FhirflyClient", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should send correct JSON-RPC body and headers", async () => {
    let capturedBody: any = null;

    globalThis.fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      capturedBody = JSON.parse(init?.body as string);
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: capturedBody.id,
        result: { tools: [] },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const client = new FhirflyClient(TEST_CONFIG);
    await client.listTools();

    expect(capturedBody.jsonrpc).toBe("2.0");
    expect(capturedBody.method).toBe("tools/list");
    expect(capturedBody.id).toBeDefined();

    const fetchCall = (globalThis.fetch as any).mock.calls[0];
    const url = fetchCall[0];
    const opts = fetchCall[1];
    expect(url).toBe("https://api.fhirfly.io/mcp");
    expect(opts.headers["x-api-key"]).toBe("ffly_test_key_123");
    expect(opts.headers["User-Agent"]).toBe("@fhirfly-io/mcp-server");
  });

  it("should return tools array from listTools", async () => {
    const mockTools = [
      { name: "ndc_get", description: "Look up NDC", inputSchema: { type: "object" } },
    ];

    globalThis.fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(init?.body as string);
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: body.id,
        result: { tools: mockTools },
      }), { status: 200 });
    });

    const client = new FhirflyClient(TEST_CONFIG);
    const result = await client.listTools();

    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe("ndc_get");
  });

  it("should return content array from callTool", async () => {
    globalThis.fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(init?.body as string);
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          content: [{ type: "text", text: '{"ndc":"0069-0151-01"}' }],
        },
      }), { status: 200 });
    });

    const client = new FhirflyClient(TEST_CONFIG);
    const result = await client.callTool("ndc_get", { code: "0069-0151-01" });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.isError).toBeUndefined();
  });

  it("should return auth error on 401", async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response("Unauthorized", { status: 401 });
    });

    const client = new FhirflyClient(TEST_CONFIG);
    const result = await client.callTool("ndc_get", { code: "test" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Authentication failed");
  });

  it("should retry once on 429 then return rate limit error", async () => {
    let callCount = 0;

    globalThis.fetch = vi.fn(async () => {
      callCount++;
      return new Response("Rate Limited", {
        status: 429,
        headers: { "Retry-After": "0" },
      });
    });

    const client = new FhirflyClient(TEST_CONFIG);
    const result = await client.callTool("ndc_get", { code: "test" });

    // Should have called fetch twice (original + retry)
    expect(callCount).toBe(2);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Rate limit");
  });

  it("should return network error on fetch failure", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error("Connection refused");
    });

    const client = new FhirflyClient(TEST_CONFIG);
    const result = await client.callTool("ndc_get", { code: "test" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Network error");
  });

  it("should increment request IDs", async () => {
    const ids: number[] = [];

    globalThis.fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(init?.body as string);
      ids.push(body.id);
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: body.id,
        result: { tools: [] },
      }), { status: 200 });
    });

    const client = new FhirflyClient(TEST_CONFIG);
    await client.listTools();
    await client.listTools();
    await client.listTools();

    expect(ids).toHaveLength(3);
    expect(ids[0]).toBeLessThan(ids[1]);
    expect(ids[1]).toBeLessThan(ids[2]);
    // Should be sequential integers, not timestamps
    expect(ids[1] - ids[0]).toBe(1);
    expect(ids[2] - ids[1]).toBe(1);
  });
});
