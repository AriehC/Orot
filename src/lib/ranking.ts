import { Post } from "./types";

// ── Tuning knobs ────────────────────────────────────────────────────────
const SAVE_WEIGHT = 2; // saves signal deeper value than likes
const BOARD_WEIGHT = 3; // board-adds = strongest curation signal
const VELOCITY_MULTIPLIER = 3; // reward for fast engagement
const GRAVITY = 1.2; // HN-style time decay exponent (lower = more evergreen)
const UNCERTAINTY_BASE = 15; // cold-start bonus ceiling for brand-new posts
const FRESHNESS_HALF_LIFE = 12; // hours until freshness nudge drops to ~37%

// Stable hash from post id for deterministic diversity factor
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function rankPosts(posts: Post[]): Post[] {
  const now = Date.now();
  const scored = posts.map((post) => ({
    post,
    score: computeScore(post, now),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.post);
}

function computeScore(post: Post, now: number): number {
  const ageHours = (now - post.createdAt.toMillis()) / 3600000;

  // ── Weighted engagement ───────────────────────────────────────────────
  // Saves and board-adds matter more than a quick like
  const engagementRaw =
    post.likeCount + post.saveCount * SAVE_WEIGHT + post.boardCount * BOARD_WEIGHT;
  const engagementScore = Math.log2(engagementRaw + 1);

  // ── Engagement velocity ───────────────────────────────────────────────
  // Posts gaining engagement quickly rank higher than slow accumulators
  const velocity = engagementRaw / Math.max(ageHours, 1);
  const velocityBonus = Math.log2(velocity + 1) * VELOCITY_MULTIPLIER;

  // ── Time decay (HN-style power law) ───────────────────────────────────
  // Division model: score / (age+2)^gravity — smooth, no cliff, long tail
  const timePenalty = Math.pow(ageHours + 2, GRAVITY);

  // ── Cold-start uncertainty bonus ──────────────────────────────────────
  // New posts with little data get an exploration boost that shrinks
  // as real engagement arrives (inspired by UCB bandits)
  const totalSignals = post.likeCount + post.saveCount + post.boardCount;
  const uncertaintyBonus = UNCERTAINTY_BASE / Math.sqrt(totalSignals + 1);

  // ── Freshness nudge (smooth exponential, no cliff) ────────────────────
  // Small bonus for very new posts, decays smoothly
  // At 0h: +10, 12h: +3.7, 24h: +1.4, 48h: +0.2
  const freshnessNudge = 10 * Math.exp(-ageHours / FRESHNESS_HALF_LIFE);

  // ── Diversity ─────────────────────────────────────────────────────────
  // Stable per-post factor from id hash for feed variety
  const diversityFactor = (hashCode(post.id) % 1500) / 100;

  // ── Final score ───────────────────────────────────────────────────────
  const numerator =
    engagementScore + velocityBonus + uncertaintyBonus + freshnessNudge + diversityFactor;
  return numerator / timePenalty;
}
