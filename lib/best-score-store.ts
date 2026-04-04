import "server-only";

import { promises as fs } from "fs";
import path from "path";

import { isBestScore, type BestScore } from "@/lib/best-score-types";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const BEST_SCORE_FILE = path.join(DATA_DIRECTORY, "best-score.json");

export function formatBestScoreDate(date = new Date()) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin"
  }).format(date);
}

export async function readBestScore() {
  try {
    const raw = await fs.readFile(BEST_SCORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    return isBestScore(parsed) ? parsed : null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function writeBestScore(bestScore: BestScore) {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });

  const tempFile = `${BEST_SCORE_FILE}.tmp`;
  const payload = JSON.stringify(bestScore, null, 2);

  await fs.writeFile(tempFile, payload, "utf8");
  await fs.rename(tempFile, BEST_SCORE_FILE);
}

export async function saveBestScore(clicks: number) {
  const currentBestScore = await readBestScore();

  if (currentBestScore && clicks > currentBestScore.clicks) {
    return {
      bestScore: currentBestScore,
      updated: false
    };
  }

  const nextBestScore: BestScore = {
    clicks,
    date: formatBestScoreDate()
  };

  await writeBestScore(nextBestScore);

  return {
    bestScore: nextBestScore,
    updated: true
  };
}
