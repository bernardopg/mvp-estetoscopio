"use client";

import MediaFlashcard, { CardContent } from "@/components/MediaFlashcard";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface Card {
  frente: CardContent | string; // Suporta formato antigo e novo
  verso: CardContent | string;
}

interface Deck {
  id: number;
  title: string;
  cards: Card[];
}

// Helper para converter formato antigo para novo
function normalizeCardContent(content: CardContent | string): CardContent {
  if (typeof content === "string") {
    return { type: "text", content };
  }
  return content;
}

export default function EstudarBaralho() {
  const params = useParams();
  const id = params.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const fetchDeck = useCallback(async () => {
    try {
      const response = await fetch(`/api/decks/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDeck({
          id: data.id,
          title: data.title,
          cards: JSON.parse(data.cards),
        });
      } else {
        alert("Baralho não encontrado");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao carregar baralho");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchDeck();
  }, [id, fetchDeck]);

  const nextCard = () => {
    if (deck && currentCardIndex < deck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-zinc-50 via-emerald-50/20 to-teal-50/20 dark:from-black dark:via-emerald-950/10 dark:to-teal-950/10 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-linear-to-br from-zinc-50 via-emerald-50/20 to-teal-50/20 dark:from-black dark:via-emerald-950/10 dark:to-teal-950/10 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Baralho não encontrado.
          </p>
          <Link
            href="/baralhos"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Voltar aos baralhos
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = deck.cards[currentCardIndex];
  const normalizedFront = normalizeCardContent(currentCard.frente);
  const normalizedBack = normalizeCardContent(currentCard.verso);

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-emerald-50/20 to-teal-50/20 dark:from-black dark:via-emerald-950/10 dark:to-teal-950/10 py-16 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/baralhos"
            className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar aos baralhos</span>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                {deck.title}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">Modo de Estudo</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                Progresso
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {currentCardIndex + 1} / {deck.cards.length}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-teal-600 transition-all duration-300"
              style={{
                width: `${((currentCardIndex + 1) / deck.cards.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <MediaFlashcard
            front={normalizedFront}
            back={normalizedBack}
            className="w-full max-w-3xl"
          />
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={prevCard}
            disabled={currentCardIndex === 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>
          <button
            onClick={nextCard}
            disabled={currentCardIndex === deck.cards.length - 1}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Próxima
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            💡 Use a tecla{" "}
            <kbd className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono text-xs">
              Espaço
            </kbd>{" "}
            para virar a carta
          </p>
        </div>
      </div>
    </div>
  );
}
