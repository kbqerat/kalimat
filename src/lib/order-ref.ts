import "server-only";

import { randomInt } from "node:crypto";

// No 0/O/1/I — avoids ambiguous refs read over the phone.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
// 7 chars over a 33-letter alphabet ≈ 33^7 (~4.3e10) combinations — high
// enough that guessing a live ref by brute force isn't practical, even
// stacked with the rate limit on the lookup page.
const LENGTH = 7;

/** Human order reference, e.g. "KAL-7F3QZ9M". Cryptographically random. */
export function makeOrderRef(): string {
  let s = "";
  for (let i = 0; i < LENGTH; i++) {
    s += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `KAL-${s}`;
}
