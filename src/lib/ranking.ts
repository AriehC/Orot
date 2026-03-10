import { Post } from "./types";

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

  // Popularity: logarithmic scale of likes (use snapshot value, don't let small changes reorder)
  const likeScore = Math.log2(post.likeCount + 1) * 10;

  // Recency: decay over time
  const freshness = Math.max(0, 30 - ageHours * 0.5);

  // Newness boost: posts less than 24h old get a bonus
  const newnessBoost = ageHours < 24 ? 50 : 0;

  // Diversity: stable per-post factor derived from id
  const diversityFactor = (hashCode(post.id) % 1500) / 100;

  return likeScore + freshness + newnessBoost + diversityFactor;
}
