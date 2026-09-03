"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dialect } from "@/types/verb";
import type { SpeechLanguage } from "@/lib/server/speech";

type PlaybackState = "idle" | "loading" | "playing" | "error";

interface SpeakButtonProps {
  text: string;
  language: SpeechLanguage;
  dialect?: Dialect;
  ariaLabel?: string;
  className?: string;
}

const audioCache = new Map<string, Blob>();
let activeStop: (() => void) | null = null;
let requestSequence = 0;

function SpeakerIcon({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6.8 8.5H3.5v7h3.3L11 19V5Z" />
      {playing ? <path d="M15.5 9.2a4.1 4.1 0 0 1 0 5.6M18.2 6.5a8 8 0 0 1 0 11" /> : <path d="M15.5 9.2a4.1 4.1 0 0 1 0 5.6" />}
    </svg>
  );
}

export function SpeakButton({ text, language, dialect, ariaLabel, className = "" }: SpeakButtonProps) {
  const [state, setState] = useState<PlaybackState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    activeStop = null;
    setState("idle");
  }, []);

  useEffect(() => () => {
    if (audioRef.current) stop();
  }, [stop]);

  const play = async () => {
    if (!text.trim() || state === "loading") return;
    if (state === "playing") {
      requestSequence += 1;
      stop();
      return;
    }

    const ticket = ++requestSequence;
    activeStop?.();
    setState("loading");

    const cacheKey = JSON.stringify([text, language, dialect ?? ""]);

    try {
      let blob = audioCache.get(cacheKey);
      if (!blob) {
        const response = await fetch("/api/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language, dialect }),
        });
        if (!response.ok) throw new Error("Speech request failed");
        blob = await response.blob();
        audioCache.set(cacheKey, blob);
      }

      if (ticket !== requestSequence) {
        setState("idle");
        return;
      }

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      urlRef.current = url;
      audioRef.current = audio;
      activeStop = stop;

      audio.onended = stop;
      audio.onerror = () => {
        stop();
        setState("error");
      };

      await audio.play();
      if (ticket === requestSequence) setState("playing");
    } catch (error) {
      console.error("Unable to play generated speech.", error);
      if (ticket === requestSequence) setState("error");
    }
  };

  const label = ariaLabel || `Play pronunciation for ${text}`;

  return (
    <button
      type="button"
      className={`speak-button ${className}`.trim()}
      data-state={state}
      aria-label={label}
      title={state === "error" ? "Audio is temporarily unavailable" : label}
      onClick={() => void play()}
      disabled={!text.trim() || state === "loading"}
    >
      {state === "loading" ? <span aria-hidden="true">…</span> : <SpeakerIcon playing={state === "playing"} />}
    </button>
  );
}
