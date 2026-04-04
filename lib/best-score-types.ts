export type BestScore = {
  clicks: number;
  date: string;
};

export function isBestScore(value: unknown): value is BestScore {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<BestScore>;

  return (
    typeof candidate.clicks === "number" &&
    Number.isInteger(candidate.clicks) &&
    candidate.clicks > 0 &&
    typeof candidate.date === "string"
  );
}
