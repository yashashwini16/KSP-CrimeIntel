/**
 * Property 20: WebSocket Reconnection Stops at 10 Attempts
 * Validates: Requirement 10.8
 */

import { describe, expect, it } from "vitest";
import { createReconnectController, MAX_RETRIES } from "@/hooks/useRealtime";

describe("Property 20 — Reconnect controller stops at MAX_RETRIES", () => {
  it("MAX_RETRIES constant equals 10", () => {
    expect(MAX_RETRIES).toBe(10);
  });

  it("canRetry() is true before any disconnects", () => {
    const ctrl = createReconnectController();
    expect(ctrl.canRetry()).toBe(true);
    expect(ctrl.count).toBe(0);
  });

  it("stops retrying after exactly 10 increments", () => {
    const ctrl = createReconnectController();
    for (let i = 0; i < 10; i++) {
      expect(ctrl.canRetry()).toBe(true);
      ctrl.increment();
    }
    expect(ctrl.count).toBe(10);
    expect(ctrl.canRetry()).toBe(false);
  });

  it("simulating 11 disconnect cycles never pushes count above 10", () => {
    const ctrl = createReconnectController();
    for (let i = 0; i < 11; i++) {
      if (ctrl.canRetry()) ctrl.increment();
    }
    expect(ctrl.count).toBe(10);
    expect(ctrl.canRetry()).toBe(false);
  });

  it("reset() brings count back to 0 and re-enables retrying", () => {
    const ctrl = createReconnectController();
    for (let i = 0; i < 10; i++) ctrl.increment();
    expect(ctrl.canRetry()).toBe(false);

    ctrl.reset();

    expect(ctrl.count).toBe(0);
    expect(ctrl.canRetry()).toBe(true);
  });

  it("custom maxRetries parameter is respected", () => {
    const ctrl = createReconnectController(3);
    ctrl.increment();
    ctrl.increment();
    ctrl.increment();
    expect(ctrl.canRetry()).toBe(false);
    expect(ctrl.count).toBe(3);
  });
});
