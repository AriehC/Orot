import { Post } from "./types";

export function rankPosts(posts: Post[]): Post[] {
  const now = Date.now();
  return [...posts].sort((a, b) => {
    return computeScore(b, now) - computeScore(a, now);
  });
}

function computeScore(post: Post, now: number): number {
  const ageHours = (now - post.createdAt.toMillis()) / 3600000;

  // Popularity: logarithmic scale of likes
  const likeScore = Math.log2(post.likeCount + 1) * 10;

  // Recency: decay over time
  const freshness = Math.max(0, 30 - ageHours * 0.5);

  // Newness boost: posts less than 24h old get a bonus
  const isNew = ageHours < 24;
  const newnessBoost = isNew ? 50 : 0;

  // Diversity: small random factor to prevent static feeds
  const diversityFactor = Math.random() * 15;

  return likeScore + freshness + newnessBoost + diversityFactor;
}
