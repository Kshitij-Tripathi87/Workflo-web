import { describe, expect, test } from "bun:test";
import { BOOKING_EMAIL, BOOKING_HREF, resolveBookingHref } from "./booking";

const FALLBACK = `mailto:${BOOKING_EMAIL}?subject=workflo%20demo%20request`;

describe("booking href", () => {
  test("defaults to the mailto fallback when nothing is configured", () => {
    expect(resolveBookingHref(undefined)).toBe(FALLBACK);
    expect(resolveBookingHref("")).toBe(FALLBACK);
    expect(resolveBookingHref("   ")).toBe(FALLBACK);
  });

  test("uses an absolute scheduler URL", () => {
    expect(resolveBookingHref("https://cal.com/workflo")).toBe("https://cal.com/workflo");
    expect(resolveBookingHref("  https://cal.com/workflo  ")).toBe("https://cal.com/workflo");
    expect(resolveBookingHref("http://localhost:3000/book")).toBe("http://localhost:3000/book");
  });

  test("accepts an explicit mailto destination", () => {
    expect(resolveBookingHref("mailto:hello@workflo.example")).toBe("mailto:hello@workflo.example");
  });

  test("rejects protocol-relative, relative and script destinations", () => {
    expect(resolveBookingHref("cal.com/workflo")).toBe(FALLBACK);
    expect(resolveBookingHref("/book")).toBe(FALLBACK);
    expect(resolveBookingHref("#book")).toBe(FALLBACK);
    expect(resolveBookingHref("javascript:alert(1)")).toBe(FALLBACK);
  });

  test("the exported href always resolves to a real destination", () => {
    expect(BOOKING_HREF).toMatch(/^(https?:\/\/|mailto:)/);
    expect(BOOKING_HREF).not.toBe("#book");
  });
});
