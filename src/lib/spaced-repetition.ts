// Sistema de Repetição Espaçada baseado no algoritmo Anki/SM-2

export type DifficultyLevel = "again" | "hard" | "good" | "easy";

export interface CardProgress {
  cardIndex: number;
  easeFactor: number; // Fator de facilidade (padrão: 2.5)
  interval: number; // Intervalo em dias
  repetitions: number; // Número de repetições corretas consecutivas
  nextReviewDate: Date;
  lastReviewed: Date;
  difficulty: DifficultyLevel | null;
}

// Inicializar progresso de um card
export function initializeCardProgress(cardIndex: number): CardProgress {
  return {
    cardIndex,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date(),
    lastReviewed: new Date(),
    difficulty: null,
  };
}

// Calcular novo intervalo baseado na dificuldade
export function calculateNextReview(
  progress: CardProgress,
  difficulty: DifficultyLevel
): CardProgress {
  const now = new Date();
  let newEaseFactor = progress.easeFactor;
  let newInterval = progress.interval;
  let newRepetitions = progress.repetitions;

  switch (difficulty) {
    case "again":
      // Resetar o card - revisar em breve
      newInterval = 0;
      newRepetitions = 0;
      newEaseFactor = Math.max(1.3, progress.easeFactor - 0.2);
      break;

    case "hard":
      // Intervalo mais curto
      if (progress.repetitions === 0) {
        newInterval = 1; // 1 dia
      } else {
        newInterval = Math.max(1, Math.round(progress.interval * 1.2));
      }
      newRepetitions += 1;
      newEaseFactor = Math.max(1.3, progress.easeFactor - 0.15);
      break;

    case "good":
      // Intervalo padrão
      if (progress.repetitions === 0) {
        newInterval = 1; // 1 dia
      } else if (progress.repetitions === 1) {
        newInterval = 6; // 6 dias
      } else {
        newInterval = Math.round(progress.interval * progress.easeFactor);
      }
      newRepetitions += 1;
      break;

    case "easy":
      // Intervalo mais longo
      if (progress.repetitions === 0) {
        newInterval = 4; // 4 dias
      } else {
        newInterval = Math.round(progress.interval * progress.easeFactor * 1.3);
      }
      newRepetitions += 1;
      newEaseFactor = Math.min(2.5, progress.easeFactor + 0.15);
      break;
  }

  // Calcular próxima data de revisão
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    ...progress,
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
    lastReviewed: now,
    difficulty,
  };
}

// Obter feedback textual baseado na dificuldade
export function getDifficultyFeedback(difficulty: DifficultyLevel): {
  message: string;
  color: string;
} {
  switch (difficulty) {
    case "again":
      return {
        message: "Você verá este card novamente em breve",
        color: "text-red-600 dark:text-red-400",
      };
    case "hard":
      return {
        message: "Revisão programada em intervalo curto",
        color: "text-amber-600 dark:text-amber-400",
      };
    case "good":
      return {
        message: "Bom trabalho! Revisão em intervalo normal",
        color: "text-emerald-600 dark:text-emerald-400",
      };
    case "easy":
      return {
        message: "Excelente! Revisão em intervalo longo",
        color: "text-sky-600 dark:text-sky-400",
      };
  }
}

// Formatar intervalo em texto legível
export function formatInterval(days: number): string {
  if (days === 0) return "hoje";
  if (days === 1) return "amanhã";
  if (days < 7) return `em ${days} dias`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `em ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
  }
  const months = Math.floor(days / 30);
  return `em ${months} ${months === 1 ? "mês" : "meses"}`;
}

// Salvar progresso no localStorage
export function saveProgress(deckId: string, progress: CardProgress[]): void {
  try {
    const key = `deck_progress_${deckId}`;
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
  }
}

// Carregar progresso do localStorage
export function loadProgress(deckId: string): CardProgress[] | null {
  try {
    const key = `deck_progress_${deckId}`;
    const data = localStorage.getItem(key);
    if (!data) return null;

    const progress = JSON.parse(data);
    // Converter strings de data de volta para objetos Date
    return progress.map((p: CardProgress) => ({
      ...p,
      nextReviewDate: new Date(p.nextReviewDate),
      lastReviewed: new Date(p.lastReviewed),
    }));
  } catch (error) {
    console.error("Erro ao carregar progresso:", error);
    return null;
  }
}
