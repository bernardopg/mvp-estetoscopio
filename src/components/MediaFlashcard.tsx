"use client";

import AudioPlayer from "@/components/AudioPlayer";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export type CardContent = {
  type: "text" | "image" | "audio";
  content: string; // Para texto é o texto, para imagem/audio é a URL
  text?: string; // Texto opcional para acompanhar imagem/áudio
};

export type MediaFlashcardProps = {
  front: CardContent;
  back: CardContent;
  className?: string;
  initialFlipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
  showControls?: boolean;
  labels?: {
    flip?: string;
    showAnswer?: string;
    hideAnswer?: string;
    again?: string;
    hard?: string;
    good?: string;
    easy?: string;
  };
};

const defaultLabels = {
  flip: "Virar carta (Espaço)",
  showAnswer: "Mostrar resposta",
  hideAnswer: "Ocultar resposta",
  again: "Novamente",
  hard: "Difícil",
  good: "Bom",
  easy: "Fácil",
};

function renderCardContent(cardContent: CardContent) {
  switch (cardContent.type) {
    case "text":
      return (
        <div className="prose text-center text-zinc-900 dark:text-zinc-50 text-2xl font-medium">
          <div dangerouslySetInnerHTML={{ __html: cardContent.content }} />
        </div>
      );

    case "image":
      return (
        <div className="flex flex-col items-center gap-4 w-full">
          {cardContent.text && (
            <div className="text-center text-zinc-900 dark:text-zinc-50 text-lg px-4 mb-2">
              {cardContent.text}
            </div>
          )}
          <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={cardContent.content}
              alt="Flashcard image"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <ImageIcon className="w-4 h-4" />
            <span>Imagem</span>
          </div>
        </div>
      );

    case "audio":
      return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-4">
          {cardContent.text && (
            <div className="text-center text-zinc-900 dark:text-zinc-50 text-lg px-4">
              {cardContent.text}
            </div>
          )}
          <AudioPlayer src={cardContent.content} />
        </div>
      );

    default:
      return null;
  }
}

export function MediaFlashcard({
  front,
  back,
  className = "",
  initialFlipped = false,
  onFlipChange,
  showControls = true,
  labels = defaultLabels,
}: MediaFlashcardProps) {
  const [flipped, setFlipped] = useState(initialFlipped);
  const cardId = useId();
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const toggle = useCallback(() => {
    setFlipped((f) => {
      const next = !f;
      onFlipChange?.(next);
      return next;
    });
  }, [onFlipChange]);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    };
    btn.addEventListener("keydown", onKeyDown);
    return () => btn.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return (
    <div className={`w-full max-w-2xl mx-auto select-none ${className}`}>
      <div className={`flashcard ${flipped ? "is-flipped" : ""}`}>
        <div className="flashcard-inner rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg">
          {/* Frente */}
          <div className="flashcard-face p-8 min-h-64 flex items-center justify-center">
            {renderCardContent(front)}
          </div>
          {/* Verso */}
          <div className="flashcard-face flashcard-back p-8 min-h-64 flex items-center justify-center">
            {renderCardContent(back)}
          </div>
        </div>
      </div>

      {/* Barra de ações */}
      <div className="mt-4 flex flex-col items-center gap-3">
        <button
          ref={btnRef}
          aria-controls={cardId}
          aria-pressed={flipped}
          onClick={toggle}
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 h-11 text-sm font-semibold shadow-sm hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400"
        >
          {flipped ? labels.hideAnswer : labels.showAnswer}
          <span className="ml-2 text-xs opacity-70">(Espaço)</span>
        </button>

        {showControls && flipped && (
          <div className="flex w-full items-center justify-center gap-2">
            <button className="h-9 rounded-md px-3 text-xs font-medium bg-red-600 text-white hover:opacity-90">
              {labels.again}
            </button>
            <button className="h-9 rounded-md px-3 text-xs font-medium bg-amber-500 text-white hover:opacity-90">
              {labels.hard}
            </button>
            <button className="h-9 rounded-md px-3 text-xs font-medium bg-emerald-600 text-white hover:opacity-90">
              {labels.good}
            </button>
            <button className="h-9 rounded-md px-3 text-xs font-medium bg-sky-600 text-white hover:opacity-90">
              {labels.easy}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaFlashcard;
