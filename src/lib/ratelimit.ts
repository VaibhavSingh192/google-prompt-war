interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}

interface BucketEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly buckets = new Map<string, BucketEntry>();

  constructor({ maxRequests, windowMs }: RateLimiterConfig) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(key: string): boolean {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || now >= existing.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (existing.count >= this.maxRequests) return false;

    existing.count += 1;
    return true;
  }
}

// Singleton: 10 requests per 60 seconds per IP
export const apiRateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60_000 });
