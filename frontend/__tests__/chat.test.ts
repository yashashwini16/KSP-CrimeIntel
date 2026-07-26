/**
 * Property 7: Chat History Is Chronologically Ordered
 * Validates: Requirement 4.11
 */

import { describe, expect, it } from "vitest";
import { sortMessagesByTimestamp } from "@/hooks/useChat";
import type { ChatMessage } from "@/types";

function makeMsg(
  id: string,
  role: ChatMessage["role"],
  timestamp: string,
): ChatMessage {
  return { id, role, content: `Message ${id}`, locale: "en", timestamp };
}

describe("Property 7 — Chat history is chronologically ordered", () => {
  it("already-sorted messages stay sorted", () => {
    const msgs = [
      makeMsg("1", "user",      "2025-06-01T10:00:00.000Z"),
      makeMsg("2", "assistant", "2025-06-01T10:00:01.000Z"),
      makeMsg("3", "user",      "2025-06-01T10:00:05.000Z"),
    ];
    const sorted = sortMessagesByTimestamp(msgs);
    expect(sorted.map((m) => m.id)).toEqual(["1", "2", "3"]);
  });

  it("reverse-order input is correctly sorted ascending", () => {
    const msgs = [
      makeMsg("3", "user",      "2025-06-01T10:00:05.000Z"),
      makeMsg("2", "assistant", "2025-06-01T10:00:01.000Z"),
      makeMsg("1", "user",      "2025-06-01T10:00:00.000Z"),
    ];
    const sorted = sortMessagesByTimestamp(msgs);
    expect(sorted.map((m) => m.id)).toEqual(["1", "2", "3"]);
  });

  it("shuffled messages are always returned in ascending timestamp order", () => {
    const timestamps = [
      "2025-06-01T09:00:00.000Z",
      "2025-06-01T09:05:00.000Z",
      "2025-06-01T09:10:00.000Z",
      "2025-06-01T09:15:00.000Z",
      "2025-06-01T09:20:00.000Z",
    ];
    // Build in sorted order first
    const ordered = timestamps.map((ts, i) =>
      makeMsg(String(i + 1), i % 2 === 0 ? "user" : "assistant", ts),
    );
    // Shuffle (reverse as a deterministic shuffle)
    const shuffled = [...ordered].reverse();

    const result = sortMessagesByTimestamp(shuffled);

    for (let i = 1; i < result.length; i++) {
      const prev = new Date(result[i - 1].timestamp).getTime();
      const curr = new Date(result[i].timestamp).getTime();
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });

  it("does not mutate the original array", () => {
    const msgs = [
      makeMsg("b", "assistant", "2025-06-01T10:00:02.000Z"),
      makeMsg("a", "user",      "2025-06-01T10:00:00.000Z"),
    ];
    const original = [...msgs];
    sortMessagesByTimestamp(msgs);
    expect(msgs[0].id).toBe(original[0].id);
    expect(msgs[1].id).toBe(original[1].id);
  });

  it("single message returns a single-element array", () => {
    const msgs = [makeMsg("1", "user", "2025-06-01T10:00:00.000Z")];
    expect(sortMessagesByTimestamp(msgs)).toHaveLength(1);
  });

  it("empty array returns empty array", () => {
    expect(sortMessagesByTimestamp([])).toEqual([]);
  });
});
