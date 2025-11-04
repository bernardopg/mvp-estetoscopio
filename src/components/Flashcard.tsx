"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";

export type FlashcardProps = {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  initialFlipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
  showControls?: boolean;
  // Labels para acessibilidade e i18n
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

export function Flashcard({
  front,
  back,
  className = "",
  initialFlipped = false,
  onFlipChange,
  showControls = true,
  labels = defaultLabels,
}: FlashcardProps) {
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

  // Atalhos de teclado: Espaço/Enter para virar quando focado
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
            <div className="prose text-center text-zinc-900 dark:text-zinc-50 text-2xl font-medium">
              {front}
            </div>
          </div>
          {/* Verso */}
          <div className="flashcard-face flashcard-back p-8 min-h-64 flex items-center justify-center">
            <div className="prose text-center text-zinc-900 dark:text-zinc-50 text-2xl font-medium">
              {back}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de ações estilo Anki */}
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

export default Flashcard;
