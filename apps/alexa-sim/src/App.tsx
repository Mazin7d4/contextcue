import { useEffect, useState } from "react";

type Card = {
  title: string;
  text: string;
  kind: string;
  refusedSpoiler?: boolean;
};

type Preferences = {
  spoilerMode: string;
  verbosity: string;
  textScale: string;
};

type Playback = {
  mediaId: string;
  positionMs: number;
  currentCueText?: string;
} | null;

const SUGGESTIONS = ["What did I miss?", "Who is he?", "Explain that line", "Why does that matter?", "Use strict mode and larger text"];

function modeLabel(mode: string | undefined): string {
  if (mode === "strict") return "Strict";
  if (mode === "catch_me_up") return "Catch Me Up";
  if (mode === "helpful") return "Helpful";
  return "Helpful";
}

export function App() {
  const [message, setMessage] = useState("");
  const [card, setCard] = useState<Card | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [playback, setPlayback] = useState<Playback>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh(): Promise<void> {
    const [prefRes, playRes] = await Promise.all([
      fetch("/v1/preferences?profileId=demo-viewer"),
      fetch("/v1/playback?profileId=demo-viewer")
    ]);
    if (prefRes.ok) {
      const body = (await prefRes.json()) as { preferences: Preferences };
      setPreferences(body.preferences);
    }
    if (playRes.ok) {
      const body = (await playRes.json()) as { playback: Playback };
      setPlayback(body.playback);
    }
  }

  useEffect(() => {
    void refresh().catch(() => setError("ContextCue isn't running. Start it with npm run dev."));
    const timer = window.setInterval(() => void refresh(), 3000);
    return () => window.clearInterval(timer);
  }, []);

  async function ask(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError("");
    setCard({ title: "ONE MOMENT", text: "Looking only at what you've already seen.", kind: "loading" });
    try {
      const response = await fetch("/v1/converse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileId: "demo-viewer", message: trimmed })
      });
      const body = (await response.json()) as { card?: Card; preferences?: Preferences; message?: string };
      if (!response.ok || !body.card) {
        setCard({ title: "COULDN'T LOAD CONTEXT", text: body.message ?? "Try that again.", kind: "error" });
        return;
      }
      setCard(body.card);
      if (body.preferences) setPreferences(body.preferences as Preferences);
      else await refresh();
      setMessage("");
    } catch {
      setCard({ title: "COULDN'T LOAD CONTEXT", text: "The ContextCue service didn't answer. Try again.", kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  const scale = preferences?.textScale === "large" ? "large" : "default";
  const position = playback ? formatTime(playback.positionMs) : "not playing";

  return (
    <main className={`stage ${scale}`}>
      <p className="banner">Simulated Alexa+ experience. Not an official Amazon simulator.</p>
      <header>
        <p className="brand">ContextCue</p>
        <h1>Understand what you missed — without rewinding or spoilers.</h1>
      </header>
      <section className="now">
        <p>The Lantern Shift</p>
        <p>{position}{playback?.currentCueText ? ` · ${playback.currentCueText}` : ""}</p>
        <p>{modeLabel(preferences?.spoilerMode)} · {preferences?.verbosity === "standard" ? "More detail" : "Short answers"} · {scale === "large" ? "Larger TV text" : "Standard TV text"}</p>
      </section>
      <section className={`card ${card?.kind ?? "empty"}`} aria-live="polite">
        {card ? (
          <>
            <p className="kicker">{card.title}</p>
            <p className="answer">{card.text}</p>
          </>
        ) : (
          <>
            <p className="kicker">ASK ABOUT THIS MOMENT</p>
            <p className="answer">The same story position from Fire TV is already here. Ask what you missed, who someone is, or what a line means.</p>
          </>
        )}
        {error ? <p className="error">{error}</p> : null}
      </section>
      <div className="suggestions">
        {SUGGESTIONS.map((item) => (
          <button key={item} type="button" onClick={() => void ask(item)} disabled={busy}>
            {item}
          </button>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void ask(message);
        }}
      >
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask about this moment"
          aria-label="Ask ContextCue"
        />
        <button type="submit" disabled={busy || message.trim().length === 0}>
          Ask
        </button>
      </form>
    </main>
  );
}

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
