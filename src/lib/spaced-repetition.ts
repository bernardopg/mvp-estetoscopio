/**
 * Implementação do Algoritmo SM-2 (SuperMemo 2)
 *
 * Referência: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 *
 * O SM-2 é um algoritmo de repetição espaçada que calcula intervalos ótimos
 * para revisão de flashcards baseado no desempenho do usuário.
 */

// Qualidade da resposta (0-5 no SM-2 original)
// Mapeamento: again=0, hard=2, good=4, easy=5
export type DifficultyLevel = "again" | "hard" | "good" | "easy";

export interface CardReview {
  cardId: string;
  quality: number; // 0-5 (SM-2 quality factor)
  easeFactor: number; // E-Factor (≥ 1.3)
  interval: number; // Intervalo em dias
  repetitions: number; // Repetições consecutivas corretas (quality ≥ 3)
  nextReviewDate: string; // ISO date string
  lastReviewed: string; // ISO date string
  difficulty: DifficultyLevel;
}

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}

/**
 * Mapeia níveis de dificuldade para valores de qualidade SM-2
 * - again (0): Resposta incorreta, resetar
 * - hard (2): Resposta correta com dificuldade
 * - good (4): Resposta correta sem hesitação
 * - easy (5): Resposta perfeita e imediata
 */
export function difficultyToQuality(difficulty: DifficultyLevel): number {
  const qualityMap: Record<DifficultyLevel, number> = {
    again: 0, // Blackout - complete failure
    hard: 2, // Correct response with serious difficulty
    good: 4, // Correct response after hesitation
    easy: 5, // Perfect response
  };
  return qualityMap[difficulty];
}

/**
 * Algoritmo SM-2 puro
 *
 * @param quality - Qualidade da resposta (0-5)
 * @param repetitions - Número de repetições consecutivas corretas
 * @param easeFactor - Fator de facilidade atual (E-Factor)
 * @param interval - Intervalo atual em dias
 * @returns Novo estado do card (easeFactor, interval, repetitions)
 */
export function calculateSM2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): SM2Result {
  let newEaseFactor = easeFactor;
  let newRepetitions = repetitions;
  let newInterval = interval;

  // Calcular novo E-Factor usando a fórmula oficial do SM-2
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // E-Factor mínimo é 1.3 (regra do SM-2)
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  // Se quality < 3, resetar repetições
  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1; // Revisar amanhã
  } else {
    // Quality ≥ 3: incrementar repetições e calcular novo intervalo
    newRepetitions += 1;

    if (newRepetitions === 1) {
      newInterval = 1; // 1 dia
    } else if (newRepetitions === 2) {
      newInterval = 6; // 6 dias
    } else {
      // I(n) = I(n-1) * EF
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  // Calcular próxima data de revisão
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    easeFactor: Math.round(newEaseFactor * 100) / 100, // 2 decimais
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
  };
}

/**
 * Processar revisão de um card
 */
export function processCardReview(
  cardId: string,
  difficulty: DifficultyLevel,
  currentReview?: CardReview
): CardReview {
  const quality = difficultyToQuality(difficulty);

  // Valores padrão para novo card
  const easeFactor = currentReview?.easeFactor ?? 2.5;
  const interval = currentReview?.interval ?? 0;
  const repetitions = currentReview?.repetitions ?? 0;

  const result = calculateSM2(quality, repetitions, easeFactor, interval);

  const now = new Date();

  return {
    cardId,
    quality,
    easeFactor: result.easeFactor,
    interval: result.interval,
    repetitions: result.repetitions,
    nextReviewDate: result.nextReviewDate.toISOString(),
    lastReviewed: now.toISOString(),
    difficulty,
  };
}

/**
 * Verificar se um card está devido para revisão
 */
export function isCardDue(nextReviewDate: string | Date): boolean {
  const reviewDate =
    typeof nextReviewDate === "string"
      ? new Date(nextReviewDate)
      : nextReviewDate;
  const now = new Date();
  return reviewDate <= now;
}

/**
 * Filtrar cards devidos para revisão
 */
export function getDueCards<T extends { nextReviewDate?: string | Date }>(
  cards: T[]
): T[] {
  return cards.filter((card) => {
    if (!card.nextReviewDate) return true; // Novo card
    return isCardDue(card.nextReviewDate);
  });
}

/**
 * Calcular estatísticas de revisão
 */
export function calculateReviewStats(reviews: CardReview[]): {
  totalReviews: number;
  averageEaseFactor: number;
  averageInterval: number;
  matureCards: number; // repetitions >= 2
  youngCards: number; // repetitions === 1
  newCards: number; // repetitions === 0
} {
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageEaseFactor: 2.5,
      averageInterval: 0,
      matureCards: 0,
      youngCards: 0,
      newCards: 0,
    };
  }

  const totalEaseFactor = reviews.reduce((sum, r) => sum + r.easeFactor, 0);
  const totalInterval = reviews.reduce((sum, r) => sum + r.interval, 0);

  const matureCards = reviews.filter((r) => r.repetitions >= 2).length;
  const youngCards = reviews.filter((r) => r.repetitions === 1).length;
  const newCards = reviews.filter((r) => r.repetitions === 0).length;

  return {
    totalReviews: reviews.length,
    averageEaseFactor:
      Math.round((totalEaseFactor / reviews.length) * 100) / 100,
    averageInterval: Math.round(totalInterval / reviews.length),
    matureCards,
    youngCards,
    newCards,
  };
}

// Obter feedback textual baseado na dificuldade
export function getDifficultyFeedback(difficulty: DifficultyLevel): {
  message: string;
  color: string;
  interval: string;
} {
  const feedbackMap: Record<
    DifficultyLevel,
    { message: string; color: string; interval: string }
  > = {
    again: {
      message: "Você verá este card novamente em breve",
      color: "text-red-600 dark:text-red-400",
      interval: "< 1 dia",
    },
    hard: {
      message: "Revisão programada em intervalo curto",
      color: "text-amber-600 dark:text-amber-400",
      interval: "1-3 dias",
    },
    good: {
      message: "Bom trabalho! Revisão em intervalo normal",
      color: "text-emerald-600 dark:text-emerald-400",
      interval: "4-7 dias",
    },
    easy: {
      message: "Excelente! Revisão em intervalo longo",
      color: "text-sky-600 dark:text-sky-400",
      interval: "8+ dias",
    },
  };

  return feedbackMap[difficulty];
}

// Formatar intervalo em texto legível
export function formatInterval(days: number): string {
  if (days === 0) return "hoje";
  if (days === 1) return "amanhã";
  if (days < 7) return `${days} dias`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? "mês" : "meses"}`;
  }
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? "ano" : "anos"}`;
}

/**
 * Obter cor do badge baseado no intervalo
 */
export function getIntervalColor(days: number): string {
  if (days === 0)
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  if (days === 1)
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  if (days < 7)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  if (days < 30)
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
}
