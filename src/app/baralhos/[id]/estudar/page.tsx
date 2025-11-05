"use client";

import MediaFlashcard, {
  CardContent,
  DifficultyLevel,
} from "@/components/MediaFlashcard";
import {
  calculateNextReview,
  CardProgress,
  formatInterval,
  getDifficultyFeedback,
  initializeCardProgress,
  loadProgress,
  saveProgress,
} from "@/lib/spaced-repetition";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const id = params.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [progress, setProgress] = useState<CardProgress[]>([]);
  const [feedback, setFeedback] = useState<{
    message: string;
    color: string;
  } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const fetchDeck = useCallback(async () => {
    try {
      const response = await fetch(`/api/decks/${id}`);
      if (response.ok) {
        const data = await response.json();
        const deckData = {
          id: data.id,
          title: data.title,
          cards: JSON.parse(data.cards),
        };
        setDeck(deckData);

        // Carregar ou inicializar progresso
        let savedProgress = loadProgress(id);
        if (!savedProgress || savedProgress.length !== deckData.cards.length) {
          // Inicializar progresso para todos os cards
          savedProgress = deckData.cards.map((_: Card, index: number) =>
            initializeCardProgress(index)
          );
        }
        if (savedProgress) {
          setProgress(savedProgress);
          saveProgress(id, savedProgress);
        }
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

  const handleDifficulty = useCallback(
    (difficulty: DifficultyLevel) => {
      if (!deck) return;

      // Atualizar progresso do card atual
      const currentProgress = progress[currentCardIndex];
      const updatedProgress = calculateNextReview(currentProgress, difficulty);
      const newProgress = [...progress];
      newProgress[currentCardIndex] = updatedProgress;

      setProgress(newProgress);
      saveProgress(id, newProgress);

      // Mostrar feedback
      const feedbackData = getDifficultyFeedback(difficulty);
      setFeedback(feedbackData);
      setShowFeedback(true);

      // Esconder feedback e avançar após 2 segundos
      setTimeout(() => {
        setShowFeedback(false);
        // Verificar se é o último card
        if (currentCardIndex === deck.cards.length - 1) {
          // Mostrar modal de conclusão
          setShowCompletionModal(true);
        } else {
          // Avançar para o próximo card
          setCurrentCardIndex(currentCardIndex + 1);
        }
      }, 2000);
    },
    [deck, progress, currentCardIndex, id]
  );

  const saveStudyProgress = async (markForReview: boolean) => {
    if (!deck) return;

    setSavingProgress(true);

    try {
      // Calcular dificuldade média
      const difficulties = progress
        .filter((p) => p.difficulty !== null)
        .map((p) => {
          switch (p.difficulty) {
            case "again":
              return 1;
            case "hard":
              return 2;
            case "good":
              return 3;
            case "easy":
              return 4;
            default:
              return 3;
          }
        });

      const avgDifficulty =
        difficulties.length > 0
          ? difficulties.reduce((a, b) => a + b, 0) / difficulties.length
          : 0;

      const cardsCompleted = progress.filter(
        (p) => p.difficulty !== null
      ).length;

      await fetch(`/api/decks/${id}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cards_completed: cardsCompleted,
          total_cards: deck.cards.length,
          average_difficulty: avgDifficulty,
          marked_for_review: markForReview,
          completed: cardsCompleted === deck.cards.length,
        }),
      });

      router.push("/baralhos");
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
      alert("Erro ao salvar progresso");
    } finally {
      setSavingProgress(false);
    }
  };

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
  const currentProgress = progress[currentCardIndex];

  // Calcular estatísticas
  const cardsReviewed = progress.filter((p) => p.difficulty !== null).length;
  const percentComplete = Math.round((cardsReviewed / deck.cards.length) * 100);

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
              <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                {cardsReviewed} revisados ({percentComplete}%)
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
                width: `${percentComplete}%`,
              }}
            />
          </div>
        </div>

        {/* Feedback de dificuldade */}
        {showFeedback && feedback && (
          <div
            className={`mb-6 p-4 rounded-xl bg-white dark:bg-zinc-900 border-2 ${
              feedback.color.includes("red")
                ? "border-red-200 dark:border-red-900"
                : feedback.color.includes("amber")
                ? "border-amber-200 dark:border-amber-900"
                : feedback.color.includes("emerald")
                ? "border-emerald-200 dark:border-emerald-900"
                : "border-sky-200 dark:border-sky-900"
            } shadow-lg animate-in fade-in slide-in-from-top-5 duration-300`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className={`w-5 h-5 ${feedback.color}`} />
              <div>
                <p className={`font-semibold ${feedback.color}`}>
                  {feedback.message}
                </p>
                {currentProgress && currentProgress.interval > 0 && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Próxima revisão: {formatInterval(currentProgress.interval)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mb-8">
          <MediaFlashcard
            front={normalizedFront}
            back={normalizedBack}
            className="w-full max-w-3xl"
            onDifficultySelect={handleDifficulty}
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

      {/* Modal de Conclusão */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => router.push("/baralhos")}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex p-4 rounded-full bg-emerald-100 dark:bg-emerald-950/50 mb-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Sessão Concluída!
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Você revisou todos os cards deste baralho
              </p>
            </div>

            {/* Estatísticas */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {cardsReviewed}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    Cards Revisados
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {percentComplete}%
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    Progresso
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-zinc-700 dark:text-zinc-300 text-center mb-4">
                Marcar este baralho para revisão?
              </p>

              <button
                onClick={() => saveStudyProgress(true)}
                disabled={savingProgress}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Bookmark className="w-4 h-4" />
                <span>
                  {savingProgress ? "Salvando..." : "Sim, revisar depois"}
                </span>
              </button>

              <button
                onClick={() => saveStudyProgress(false)}
                disabled={savingProgress}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {savingProgress ? "Salvando..." : "Não precisa revisar"}
                </span>
              </button>

              <button
                onClick={() => router.push("/baralhos")}
                disabled={savingProgress}
                className="w-full px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors text-sm disabled:opacity-50"
              >
                Voltar sem salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
