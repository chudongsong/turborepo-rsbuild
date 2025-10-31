import type { describe, it, expect } from '@rstest/core';

declare global {
  const describe: typeof describe;
  const it: typeof it;
  const expect: typeof expect;
}