import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RateLimiter } from "@/lib/ratelimit";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({ maxRequests: 3, windowMs: 60_000 });
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it("allows requests under the limit", () => {
    expect(limiter.check("ip1")).toBe(true);
    expect(limiter.check("ip1")).toBe(true);
    expect(limiter.check("ip1")).toBe(true);
  });

  it("blocks the 4th request within window", () => {
    limiter.check("ip1");
    limiter.check("ip1");
    limiter.check("ip1");
    expect(limiter.check("ip1")).toBe(false);
  });

  it("resets after window expires", () => {
    limiter.check("ip1");
    limiter.check("ip1");
    limiter.check("ip1");
    vi.advanceTimersByTime(61_000);
    expect(limiter.check("ip1")).toBe(true);
  });

  it("tracks different IPs independently", () => {
    limiter.check("ip1");
    limiter.check("ip1");
    limiter.check("ip1");
    expect(limiter.check("ip1")).toBe(false);
    expect(limiter.check("ip2")).toBe(true);
  });
});
