/**
 * MCP Stdio Transport
 * Handles JSON-RPC communication over stdin/stdout
 */

import { createInterface } from "readline";
import type { JsonRpcRequest, JsonRpcResponse } from "./types.js";

export type MessageHandler = (request: JsonRpcRequest) => Promise<JsonRpcResponse>;

export class StdioTransport {
  private handler: MessageHandler | null = null;
  private debug: boolean;
  private pendingRequests: number = 0;
  private stdinClosed: boolean = false;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  /**
   * Set the handler for incoming messages
   */
  setHandler(handler: MessageHandler): void {
    this.handler = handler;
  }

  /**
   * Start listening for messages on stdin
   */
  start(): void {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    // Buffer for accumulating partial messages
    let buffer = "";

    rl.on("line", async (line) => {
      buffer += line;

      // Try to parse as JSON
      try {
        const request = JSON.parse(buffer) as JsonRpcRequest;
        buffer = ""; // Clear buffer on successful parse

        if (this.debug) {
          console.error("[MCP DEBUG] Received:", JSON.stringify(request, null, 2));
        }

        if (this.handler) {
          this.pendingRequests++;
          try {
            const response = await this.handler(request);
            this.send(response);
          } finally {
            this.pendingRequests--;
            this.maybeExit();
          }
        }
      } catch {
        // If parse fails, might be partial message - keep buffering
        // Unless it looks like a complete but invalid message
        if (line.trim().endsWith("}")) {
          this.sendError(null, -32700, "Parse error: Invalid JSON");
          buffer = "";
        }
      }
    });

    rl.on("close", () => {
      this.stdinClosed = true;
      if (this.debug) {
        console.error("[MCP DEBUG] stdin closed, waiting for pending requests...");
      }
      this.maybeExit();
    });

    // Handle errors gracefully
    process.stdin.on("error", (err) => {
      if (this.debug) {
        console.error("[MCP DEBUG] stdin error:", err.message);
      }
    });
  }

  /**
   * Exit if stdin is closed and no pending requests
   */
  private maybeExit(): void {
    if (this.stdinClosed && this.pendingRequests === 0) {
      if (this.debug) {
        console.error("[MCP DEBUG] All requests complete, exiting");
      }
      process.exit(0);
    }
  }

  /**
   * Send a JSON-RPC response to stdout
   */
  send(response: JsonRpcResponse): void {
    const message = JSON.stringify(response);

    if (this.debug) {
      console.error("[MCP DEBUG] Sending:", JSON.stringify(response, null, 2));
    }

    // Write to stdout with newline
    process.stdout.write(message + "\n");
  }

  /**
   * Send an error response
   */
  sendError(id: string | number | null, code: number, message: string, data?: unknown): void {
    this.send({
      jsonrpc: "2.0",
      id,
      error: {
        code,
        message,
        data,
      },
    });
  }
}
