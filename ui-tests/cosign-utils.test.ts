import { describe, expect, it } from "vitest";
import { canonicalHandshakeUrl, cleanAscii, getStatus, isNetwork, isPrintableAscii, validateCard } from "@/lib/cosign";
import type { Handshake } from "@/lib/types";

const card: Handshake = { id: 1n, network: "celo", creator: "0x1", signer: null, intendedSigner: null, kind: 0, context: "Meetup", note: "We met.", createdAt: 100, expiresAt: 300, completedAt: null, cancelled: false };

describe("CoSign domain utilities", () => {
  it("normalizes whitespace and preserves limits", () => expect(cleanAscii("  hello   mutual world  ", 12)).toBe("hello mutual"));
  it("rejects emoji and control characters", () => { expect(isPrintableAscii("hello")).toBe(true); expect(isPrintableAscii("hello 🚀")).toBe(false); expect(validateCard("x", "hello 🚀").errors.note).toMatch(/ASCII/); });
  it("derives lifecycle status with stable precedence", () => {
    expect(getStatus(card, 200)).toBe("pending");
    expect(getStatus({ ...card, expiresAt: 150 }, 200)).toBe("expired");
    expect(getStatus({ ...card, signer: "0x2", expiresAt: 150 }, 200)).toBe("completed");
    expect(getStatus({ ...card, signer: "0x2", cancelled: true }, 200)).toBe("cancelled");
  });
  it("builds canonical URLs and validates route networks", () => { expect(canonicalHandshakeUrl("https://cosign.test/", "stacks", 4n)).toBe("https://cosign.test/app/stacks/handshake/4"); expect(isNetwork("celo")).toBe(true); expect(isNetwork("base")).toBe(false); });
});
