"use client";

import type { CSSProperties } from "react";
import { useEffect, useReducer, useState } from "react";

import type { BestScore } from "@/lib/best-score-types";

const GRID_SIZE = 25;
const EGG_COUNT = 5;
const INITIAL_MESSAGE = "Klicke auf die Felder, um Eier zu finden! 🔍";

const PETAL_COLORS = ["#e8c84a", "#f4845f", "#6ab4d8", "#7bbf8a", "#f8c8d0"];
const EGG_EMOJIS = ["🥚", "🥚", "🐣", "🥚", "🐣"];
const FIELD_EMOJIS = ["🌸", "🌼", "🌺", "🌻", "🌷", "🪷", "💐", "🌹"];
const CONFETTI_COLORS = ["#e8c84a", "#f4845f", "#6ab4d8", "#7bbf8a", "#f8c8d0"];

const QUOTES = [
  "Möge dieses Ostern dir genauso viel Freude bringen, wie du in das Leben anderer trägst. Frohe Ostern! 🐰",
  "Frühling liegt in der Luft und mit ihm all die Wärme, die du verdienst. 🌸",
  "Manchmal braucht es nur ein buntes Ei und ein Lächeln, um den Tag zu verschönern. 🥚",
  "Möge dein Ostern so süß sein wie die Schokolade im Nest. 🍫",
  "Neuer Anfang, frische Blüten und viele kleine Glücksmomente. 🌼",
  "Wer sucht, der findet nicht nur Ostereier, sondern auch Freude. 🍀"
];

const WISHES = [
  {
    icon: "🌸",
    title: "Frühlingsfreude",
    text: "Möge der Frühling dir Wärme, Farben und neue Energie schenken."
  },
  {
    icon: "🍫",
    title: "Süße Momente",
    text: "Viel Schokolade, Lachen und unvergessliche Augenblicke für dich."
  },
  {
    icon: "🐣",
    title: "Neuer Anfang",
    text: "Ostern ist die Zeit für Hoffnung, Neustart und frische Ideen."
  },
  {
    icon: "💛",
    title: "Herzliche Wärme",
    text: "Umgeben von lieben Menschen, die dir wirklich guttun."
  }
];

type Petal = {
  id: number;
  left: number;
  top: number;
  color: string;
  duration: number;
  delay: number;
  size: number;
  rotate: number;
  drift: number;
};

type ConfettiPiece = {
  id: number;
  left: number;
  top: number;
  color: string;
  dx: number;
  size: number;
  delay: number;
  circle: boolean;
};

type GameCell = {
  index: number;
  hiddenContent: string;
  isEgg: boolean;
  revealed: boolean;
};

type GameState = {
  cells: GameCell[];
  found: number;
  clicks: number;
  gameOver: boolean;
  message: string;
};

type GameAction =
  | { type: "reset" }
  | {
    type: "reveal";
    index: number;
  };

type BestScoreResponse = {
  bestScore: BestScore | null;
  error?: string;
};

type SaveScoreResponse = {
  bestScore: BestScore;
  updated: boolean;
  error?: string;
};

const EMPTY_GAME_STATE: GameState = {
  cells: Array.from({ length: GRID_SIZE }, (_, index) => ({
    index,
    hiddenContent: "🌿",
    isEgg: false,
    revealed: false
  })),
  found: 0,
  clicks: 0,
  gameOver: false,
  message: INITIAL_MESSAGE
};

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function createRandomSet(count: number, max: number) {
  const values = new Set<number>();

  while (values.size < count) {
    values.add(Math.floor(Math.random() * max));
  }

  return values;
}

function buildGameState(): GameState {
  const eggs = createRandomSet(EGG_COUNT, GRID_SIZE);

  return {
    cells: Array.from({ length: GRID_SIZE }, (_, index) => {
      const isEgg = eggs.has(index);

      return {
        index,
        hiddenContent: isEgg ? pickRandom(EGG_EMOJIS) : pickRandom(FIELD_EMOJIS),
        isEgg,
        revealed: false
      };
    }),
    found: 0,
    clicks: 0,
    gameOver: false,
    message: INITIAL_MESSAGE
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "reset") {
    return buildGameState();
  }

  const target = state.cells[action.index];
  if (!target || target.revealed || state.gameOver) {
    return state;
  }

  const cells = state.cells.map((cell) =>
    cell.index === action.index ? { ...cell, revealed: true } : cell
  );
  const clicks = state.clicks + 1;

  if (target.isEgg) {
    const found = state.found + 1;
    const gameOver = found === EGG_COUNT;

    return {
      cells,
      found,
      clicks,
      gameOver,
      message: gameOver
        ? `🎉 Alle ${EGG_COUNT} Eier gefunden! Super!`
        : `Ei gefunden! Noch ${EGG_COUNT - found} zu finden ... 🐣`
    };
  }

  return {
    ...state,
    cells,
    clicks,
    message:
      clicks % 5 === 0
        ? "Schau weiter! Die Eier warten irgendwo im Gras ... 🔍"
        : state.message
  };
}

function createPetals(): Petal[] {
  return Array.from({ length: 24 }, (_, index) => ({
    id: index,
    left: Math.random() * 100,
    top: Math.random() * -120,
    color: pickRandom(PETAL_COLORS),
    duration: 10 + Math.random() * 8,
    delay: Math.random() * 12,
    size: 18 + Math.random() * 16,
    rotate: -30 + Math.random() * 60,
    drift: (Math.random() - 0.5) * 140
  }));
}

function shuffleQuotes(quotes: string[]) {
  const copy = [...quotes];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function formatBestScoreSummary(bestScore: BestScore) {
  return `Aktueller Bestwert: ${bestScore.clicks} Klick${bestScore.clicks === 1 ? "" : "s"
    }, gespeichert am ${bestScore.date}.`;
}

function SectionIntro({
  title,
  emphasis,
  subtitle
}: {
  title: string;
  emphasis: string;
  subtitle: string;
}) {
  return (
    <div className="reveal-up text-center" data-reveal>
      <h2 className="section-title">
        {title} <em>{emphasis}</em>
      </h2>
      <p className="section-sub">{subtitle}</p>
    </div>
  );
}

function BunnyIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="h-full w-full drop-shadow-[0_12px_24px_rgba(122,82,48,0.12)]"
      viewBox="0 0 140 140"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="70" cy="132" fill="rgba(0,0,0,0.08)" rx="30" ry="6" />
      <ellipse cx="70" cy="100" fill="#f5f0e8" rx="32" ry="36" />
      <circle cx="70" cy="62" fill="#f5f0e8" r="26" />
      <ellipse cx="55" cy="30" fill="#f5f0e8" rx="9" ry="22" />
      <ellipse cx="55" cy="30" fill="#f8c8d0" rx="5" ry="16" />
      <ellipse cx="85" cy="30" fill="#f5f0e8" rx="9" ry="22" />
      <ellipse cx="85" cy="30" fill="#f8c8d0" rx="5" ry="16" />
      <circle cx="62" cy="60" fill="#3a2a1a" r="4" />
      <circle cx="78" cy="60" fill="#3a2a1a" r="4" />
      <circle cx="63.5" cy="58.5" fill="white" r="1.5" />
      <circle cx="79.5" cy="58.5" fill="white" r="1.5" />
      <ellipse cx="70" cy="68" fill="#f48faa" rx="3.5" ry="2.5" />
      <path
        d="M 67 70 Q 70 74 73 70"
        fill="none"
        stroke="#c87890"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
      <circle cx="57" cy="68" fill="#f9c4ca" opacity="0.5" r="5" />
      <circle cx="83" cy="68" fill="#f9c4ca" opacity="0.5" r="5" />
      <ellipse cx="70" cy="105" fill="#f9f0e0" rx="16" ry="18" />
      <ellipse cx="52" cy="126" fill="#f5f0e8" rx="10" ry="7" />
      <ellipse cx="88" cy="126" fill="#f5f0e8" rx="10" ry="7" />
      <ellipse cx="96" cy="108" fill="#d4a055" rx="16" ry="11" />
      <rect fill="#e8b860" height="20" rx="6" width="32" x="80" y="98" />
      <ellipse cx="96" cy="98" fill="#d4a055" rx="16" ry="5" />
      <ellipse cx="88" cy="96" fill="#6ab4d8" rx="6" ry="8" />
      <ellipse cx="97" cy="94" fill="#f4845f" rx="6" ry="8" />
      <ellipse cx="106" cy="96" fill="#7bbf8a" rx="6" ry="8" />
      <path
        d="M 82 98 Q 96 82 110 98"
        fill="none"
        stroke="#d4a055"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function BunnyFlakeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="23" cy="13" rx="5.5" ry="12" fill="currentColor" />
      <ellipse cx="35" cy="13" rx="5.5" ry="12" fill="currentColor" />
      <circle cx="29" cy="25" r="10.5" fill="currentColor" />
      <ellipse cx="39" cy="42" rx="17" ry="13" fill="currentColor" />
      <circle cx="53" cy="38" r="6" fill="currentColor" opacity="0.95" />
      <circle cx="19" cy="37" r="4.5" fill="currentColor" opacity="0.9" />
      <circle cx="32" cy="24" r="1.7" fill="white" opacity="0.55" />
    </svg>
  );
}

export default function EasterExperience() {
  const [game, dispatch] = useReducer(gameReducer, EMPTY_GAME_STATE);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [quoteList, setQuoteList] = useState<string[]>([QUOTES[0]]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteAnimation, setQuoteAnimation] = useState<"idle" | "out" | "in">(
    "idle"
  );
  const [isStaticQuote, setIsStaticQuote] = useState(false);
  const [bestScore, setBestScore] = useState<BestScore | null>(null);
  const [isLoadingBestScore, setIsLoadingBestScore] = useState(true);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [scoreFeedback, setScoreFeedback] = useState("");
  const [serverFeedback, setServerFeedback] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [lastSubmittedClicks, setLastSubmittedClicks] = useState<number | null>(null);

  const currentQuote = quoteList[quoteIndex] ?? QUOTES[0];

  useEffect(() => {
    dispatch({ type: "reset" });
    setPetals(createPetals());
    void loadBestScore();

    const params = new URLSearchParams(window.location.search);
    const quoteParamValue = params.get("quote");
    const quoteParam =
      quoteParamValue === null ? null : Number.parseInt(quoteParamValue, 10);

    if (
      quoteParam !== null &&
      Number.isInteger(quoteParam) &&
      quoteParam >= 0 &&
      quoteParam < QUOTES.length
    ) {
      setQuoteList(QUOTES);
      setQuoteIndex(quoteParam);
      setIsStaticQuote(true);
      return;
    }

    setQuoteList(shuffleQuotes(QUOTES));
    setQuoteIndex(0);
    setIsStaticQuote(false);
  }, []);

  useEffect(() => {
    if (isStaticQuote || quoteList.length < 2) {
      return;
    }

    let outTimeout = 0;
    let inTimeout = 0;
    const interval = window.setInterval(() => {
      setQuoteAnimation("out");

      outTimeout = window.setTimeout(() => {
        setQuoteIndex((current) => (current + 1) % quoteList.length);
        setQuoteAnimation("in");
      }, 320);

      inTimeout = window.setTimeout(() => {
        setQuoteAnimation("idle");
      }, 640);
    }, 4500);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(outTimeout);
      window.clearTimeout(inTimeout);
    };
  }, [isStaticQuote, quoteList]);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!game.gameOver || lastSubmittedClicks === game.clicks) {
      return;
    }

    setLastSubmittedClicks(game.clicks);
    void submitScore(game.clicks);
  }, [game.gameOver, game.clicks, lastSubmittedClicks]);

  async function loadBestScore() {
    setIsLoadingBestScore(true);
    setServerFeedback("");

    try {
      const response = await fetch("/api/best-score", {
        cache: "no-store"
      });
      const data = (await response.json()) as BestScoreResponse;

      if (!response.ok) {
        throw new Error(data.error || "Der Server-Bestwert konnte nicht geladen werden.");
      }

      setBestScore(data.bestScore);
    } catch (error) {
      setBestScore(null);
      setServerFeedback(
        error instanceof Error
          ? error.message
          : "Der Server-Bestwert konnte nicht geladen werden."
      );
    } finally {
      setIsLoadingBestScore(false);
    }
  }

  async function submitScore(clicks: number) {
    setIsSavingScore(true);
    setScoreFeedback("Alle 5 Eier gefunden - Ergebnis wird an den Server gesendet ...");

    try {
      const response = await fetch("/api/best-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ clicks })
      });
      const data = (await response.json()) as SaveScoreResponse;

      if (!response.ok) {
        throw new Error(data.error || "Der Bestwert konnte nicht gespeichert werden.");
      }

      setBestScore(data.bestScore);
      setServerFeedback("");
      setScoreFeedback(
        data.updated
          ? `Server-Bestwert gespeichert: ${data.bestScore.clicks} Klick${data.bestScore.clicks === 1 ? "" : "s"
          }.`
          : `Nicht verbessert. ${formatBestScoreSummary(data.bestScore)}`
      );
    } catch (error) {
      setScoreFeedback(
        error instanceof Error
          ? error.message
          : "Der Bestwert konnte nicht gespeichert werden."
      );
    } finally {
      setIsSavingScore(false);
    }
  }

  function handleResetGame() {
    dispatch({ type: "reset" });
    setScoreFeedback("");
    setLastSubmittedClicks(null);
  }

  function spawnConfetti(rect: DOMRect) {
    const baseId = Date.now();
    const pieces = Array.from({ length: 12 }, (_, index) => ({
      id: baseId + index,
      left: rect.left + rect.width / 2 + (Math.random() - 0.5) * 20,
      top: rect.top + rect.height / 2,
      color: pickRandom(CONFETTI_COLORS),
      dx: (Math.random() - 0.5) * 120,
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.2,
      circle: Math.random() > 0.5
    }));

    setConfetti((current) => [...current, ...pieces]);
    window.setTimeout(() => {
      setConfetti((current) =>
        current.filter((piece) => !pieces.some((entry) => entry.id === piece.id))
      );
    }, 1800);
  }

  function handleRevealCell(index: number, rect: DOMRect) {
    const cell = game.cells[index];

    if (!cell || cell.revealed || game.gameOver) {
      return;
    }

    if (cell.isEgg) {
      spawnConfetti(rect);
    }

    dispatch({ type: "reveal", index });
  }

  function getShareUrl() {
    const originalIndex = QUOTES.indexOf(currentQuote);
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return originalIndex >= 0 ? `${baseUrl}?quote=${originalIndex}` : baseUrl;
  }

  async function handleCopyLink() {
    const url = getShareUrl();

    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedback("Link wurde kopiert.");
    } catch {
      setCopyFeedback(url);
    }

    window.setTimeout(() => setCopyFeedback(""), 3000);
  }

  function handleShareWhatsApp() {
    const shareText = encodeURIComponent(
      `🐰 Frohe Ostern! Schau dir diese kleine Osterkarte an: ${getShareUrl()}`
    );

    window.open(
      `https://wa.me/?text=${shareText}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const bestScoreValue = isLoadingBestScore
    ? "..."
    : bestScore
      ? `${bestScore.clicks}`
      : serverFeedback
        ? "!"
        : "-";

  const bestScoreMeta = isLoadingBestScore
    ? "lädt gerade"
    : bestScore
      ? `vom ${bestScore.date}`
      : serverFeedback
        ? "Serverfehler"
        : "noch leer";

  const statusMessage = serverFeedback || scoreFeedback || "\u00A0";
  const statusColor = serverFeedback
    ? "text-coral"
    : scoreFeedback && !isSavingScore
      ? "text-sage"
      : "text-brown/50";

  return (
    <main className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        {petals.map((petal) => (
          <span
            key={petal.id}
            className="petal"
            style={
              {
                left: `${petal.left}vw`,
                top: `${petal.top}px`,
                color: petal.color,
                animationDuration: `${petal.duration}s`,
                animationDelay: `${petal.delay}s`,
                width: `${petal.size}px`,
                height: `${petal.size}px`,
                "--petal-drift": `${petal.drift}px`,
                "--flake-rotate": `${petal.rotate}deg`
              } as CSSProperties
            }
          >
            <BunnyFlakeIcon />
          </span>
        ))}

        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece"
            style={
              {
                left: `${piece.left}px`,
                top: `${piece.top}px`,
                background: piece.color,
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                animationDelay: `${piece.delay}s`,
                borderRadius: piece.circle ? "999px" : "3px",
                "--confetti-dx": `${piece.dx}px`
              } as CSSProperties
            }
          />
        ))}
      </div>

      <section className="section-shell min-h-screen bg-[linear-gradient(160deg,#d4eef7_0%,#e8f9ee_35%,#fff7d6_65%,#ffe0cc_100%)]">
        <div aria-hidden="true" className="absolute inset-0">
          <span className="cloud cloud-a" />
          <span className="cloud cloud-b" />
          <span className="cloud cloud-c" />
        </div>

        <div className="section-inner flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
          <div className="mx-auto mb-6 h-36 w-36 sm:h-40 sm:w-40">
            <BunnyIllustration />
          </div>

          <div className="reveal-up visible max-w-3xl">
            <p className="mb-4 font-mono inline-flex rounded-full border border-white/60 bg-white/50 px-4 py-2 text-xs uppercase tracking-[0.22em] text-brown/70 backdrop-blur-sm">
              Hippel Hoppel ...
            </p>
            <h1 className="font-display text-[clamp(3.4rem,10vw,6.2rem)] leading-none text-brown drop-shadow-[2px_2px_0_rgba(255,255,255,0.55)]">
              Frohe <br />
              <span className="italic text-coral">Ostern!</span> 🌸
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-[#5a7a60] sm:text-xl">
              Eine kleine Osterseite mit Ostereiersuche, rotierenden Grüßen und
              bunten Hasenflocken, die wie ein leichter Osterschnee über den Hintergründen gleiten.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a className="btn btn-primary" href="#spiel">
                Los geht&apos;s
              </a>
              <a className="btn btn-soft" href="#spiel">
                Zur Ostereiersuche
              </a>
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[120px]">
          <svg
            className="h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 1440 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 60 Q 20 20 40 55 Q 60 20 80 50 Q 100 15 120 55 Q 140 25 160 50 Q 180 10 200 55 Q 220 30 240 50 Q 260 18 280 55 Q 300 22 320 50 Q 340 15 360 55 Q 380 28 400 50 Q 420 12 440 55 Q 460 25 480 52 Q 500 20 520 55 Q 540 30 560 50 Q 580 16 600 55 Q 620 22 640 52 Q 660 18 680 55 Q 700 28 720 50 Q 740 12 760 55 Q 780 25 800 50 Q 820 20 840 55 Q 860 30 880 50 Q 900 15 920 55 Q 940 22 960 52 Q 980 18 1000 55 Q 1020 28 1040 50 Q 1060 14 1080 55 Q 1100 25 1120 50 Q 1140 20 1160 55 Q 1180 30 1200 50 Q 1220 15 1240 55 Q 1260 22 1280 52 Q 1300 18 1320 55 Q 1340 25 1360 50 Q 1380 20 1400 55 Q 1420 28 1440 50 L1440 120 L0 120 Z"
              fill="#7bbf8a"
            />
            <path
              d="M0 75 Q 30 45 60 72 Q 90 45 120 70 Q 150 48 180 72 Q 210 42 240 70 Q 270 48 300 72 Q 330 44 360 70 Q 390 46 420 72 Q 450 42 480 70 Q 510 48 540 72 Q 570 45 600 70 Q 630 42 660 72 Q 690 48 720 70 Q 750 44 780 72 Q 810 46 840 70 Q 870 42 900 72 Q 930 48 960 70 Q 990 45 1020 72 Q 1050 42 1080 70 Q 1110 46 1140 72 Q 1170 42 1200 70 Q 1230 48 1260 72 Q 1290 44 1320 70 Q 1350 46 1380 72 Q 1410 42 1440 70 L1440 120 L0 120 Z"
              fill="#5aa068"
            />
          </svg>
        </div>
      </section>

      <section className="section-shell bg-[linear-gradient(180deg,#e8f9ee_0%,#fff7d6_100%)]">
        <div className="section-inner">
          <SectionIntro
            emphasis="für dich"
            subtitle="Was Ostern alles mitbringt"
            title="Osterwünsche"
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {WISHES.map((wish, index) => (
              <article
                key={wish.title}
                className="egg-card"
                data-reveal
                style={{ transitionDelay: `${index * 0.12}s` }}
              >
                <span className="mb-4 block text-5xl">{wish.icon}</span>
                <h3 className="font-display text-2xl text-brown">{wish.title}</h3>
                <p className="mt-3 text-base leading-7 text-brown/65">
                  {wish.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section-shell bg-[linear-gradient(180deg,#fff7d6_0%,#ffe0cc_100%)]"
        id="spiel"
      >
        <div className="section-inner">
          <SectionIntro
            emphasis="Ostereiersuche"
            subtitle="Findest du alle 5 Eier mit so wenig wie möglichen Klicks?"
            title="Kleine"
          />

          <div
            className="glass-panel reveal-up mx-auto mt-12 max-w-3xl p-6 sm:p-8"
            data-reveal
          >
            <div className="grid gap-4 text-center text-brown sm:grid-cols-3">
              <div className="rounded-[1.5rem] bg-white/80 px-5 py-4 shadow-[0_10px_30px_rgba(122,82,48,0.08)]">
                <strong className="block text-3xl">{game.found}</strong>
                <span className="mt-1 block text-sm font-medium text-brown/60">
                  von {EGG_COUNT} Eiern gefunden
                </span>
              </div>
              <div className="rounded-[1.5rem] bg-white/80 px-5 py-4 shadow-[0_10px_30px_rgba(122,82,48,0.08)]">
                <strong className="block text-3xl">{game.clicks}</strong>
                <span className="mt-1 block text-sm font-medium text-brown/60">
                  Klicks
                </span>
              </div>
              <div className="rounded-[1.5rem] bg-white/80 px-5 py-4 shadow-[0_10px_30px_rgba(122,82,48,0.08)]">
                <strong className="block text-3xl">{bestScoreValue}</strong>
                <span className="mt-1 block text-sm font-medium text-brown/60">
                  Beste Ergebnis
                </span>
                <span className="mt-1 block text-xs font-medium uppercase tracking-[0.14em] text-brown/40">
                  {bestScoreMeta}
                </span>
              </div>
            </div>

            <p className="mt-6 text-center font-mono text-2xl text-coral">
              {game.message}
            </p>
            <p className={`mt-3 min-h-6 text-center text-sm font-medium ${statusColor}`}>
              {statusMessage}
            </p>

            <div className="mt-8 grid grid-cols-5 gap-2 sm:gap-3">
              {game.cells.map((cell) => (
                <button
                  key={cell.index}
                  type="button"
                  aria-label={`Feld ${cell.index + 1}`}
                  className={[
                    "relative aspect-square overflow-hidden rounded-[1.1rem] border-2 text-2xl transition duration-200 sm:text-3xl",
                    cell.revealed
                      ? "cell-pop cursor-default"
                      : "hover:-translate-y-1 hover:scale-[1.04]",
                    cell.revealed && cell.isEgg
                      ? "border-gold bg-[#fff7cc]"
                      : cell.revealed
                        ? "border-[#b9d8b9] bg-[#d0ead0]"
                        : "border-[#c8e8c8] bg-[#e8f5e8]"
                  ].join(" ")}
                  onClick={(event) =>
                    handleRevealCell(
                      cell.index,
                      event.currentTarget.getBoundingClientRect()
                    )
                  }
                >
                  <span
                    className={[
                      "absolute inset-0 flex items-center justify-center transition duration-200",
                      cell.revealed ? "scale-75 opacity-0" : "scale-100 opacity-100"
                    ].join(" ")}
                  >
                    🌿
                  </span>
                  <span
                    className={[
                      "absolute inset-0 flex items-center justify-center transition duration-200",
                      cell.revealed ? "scale-100 opacity-100" : "scale-75 opacity-0"
                    ].join(" ")}
                  >
                    {cell.hiddenContent}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center">
              <button
                className="btn btn-soft"
                type="button"
                onClick={handleResetGame}
              >
                Neu spielen
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-[linear-gradient(180deg,#ffe0cc_0%,#e8d5f5_100%)]">
        <div className="section-inner">
          <SectionIntro
            emphasis="von Herzen"
            subtitle="Mit lieben Gedanken an dich"
            title="Ein Ostergruß"
          />

          <div className="message-card mx-auto mt-12 max-w-3xl" data-reveal>
            <p className="relative z-10 text-center font-display text-[clamp(1.6rem,3vw,2.3rem)] leading-[1.55] text-brown italic">
              <span className="mr-2 align-[-0.35em] text-6xl leading-none text-gold">
                &quot;
              </span>
              <span
                className={[
                  "quote-text inline-block",
                  quoteAnimation === "out" ? "animating-out" : "",
                  quoteAnimation === "in" ? "animating-in" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {currentQuote}
              </span>
              <span className="ml-2 align-[-0.35em] text-6xl leading-none text-gold">
                &quot;
              </span>
            </p>
            <p className="relative z-10 mt-6 text-center text-sm font-medium uppercase tracking-[0.18em] text-brown/45">
              Mit viel Liebe gesendet
            </p>
          </div>

          <div
            className="reveal-up mt-10 flex flex-wrap items-center justify-center gap-4"
            data-reveal
          >
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleCopyLink}
            >
              Link kopieren
            </button>
            <button
              className="btn btn-soft"
              type="button"
              onClick={handleShareWhatsApp}
            >
              WhatsApp teilen
            </button>
          </div>

          <p className="mt-5 text-center text-sm font-medium text-sage">
            {copyFeedback || "\u00A0"}
          </p>
        </div>
      </section>

      <footer className="section-shell bg-[linear-gradient(180deg,#efe2f7_0%,#f7f2fb_100%)] py-12 text-center">
        <div className="section-inner">
          <p className="text-3xl tracking-[0.3em]">🥚🐣🌸🐰🌼</p>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-brown/40">
            Frohe Ostern, mit Liebe gestaltet
          </p>
        </div>
      </footer>
    </main>
  );
}
