import {
  calculateNextReview,
  calculateReviewStats,
  calculateSM2,
  difficultyToQuality,
  formatInterval,
  getDueCards,
  getIntervalColor,
  initializeCardProgress,
  isCardDue,
  processCardReview,
  type CardProgress,
  type CardReview,
} from "@/lib/spaced-repetition";

describe("difficultyToQuality", () => {
  it("mapeia os 4 níveis para a escala SM-2", () => {
    expect(difficultyToQuality("again")).toBe(0);
    expect(difficultyToQuality("hard")).toBe(2);
    expect(difficultyToQuality("good")).toBe(4);
    expect(difficultyToQuality("easy")).toBe(5);
  });
});

describe("calculateSM2", () => {
  it("primeira repetição correta gera intervalo de 1 dia", () => {
    const result = calculateSM2(4, 0, 2.5, 0);
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.nextReviewDate.getTime()).toBeGreaterThan(Date.now());
  });

  it("segunda repetição correta gera intervalo de 6 dias", () => {
    const result = calculateSM2(4, 1, 2.5, 1);
    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
  });

  it("terceira repetição multiplica o intervalo pelo E-Factor", () => {
    const result = calculateSM2(4, 2, 2.5, 6);
    expect(result.repetitions).toBe(3);
    expect(result.interval).toBe(Math.round(6 * result.easeFactor));
  });

  it("resposta incorreta (quality < 3) reseta repetições e volta para 1 dia", () => {
    const result = calculateSM2(0, 5, 2.5, 30);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it("E-Factor nunca fica abaixo de 1.3", () => {
    const result = calculateSM2(0, 0, 1.3, 1);
    expect(result.easeFactor).toBe(1.3);
  });

  it("atualiza o E-Factor pela fórmula oficial do SM-2", () => {
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const quality = 4;
    const easeFactor = 2.5;
    const expected =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    const result = calculateSM2(quality, 0, easeFactor, 0);
    expect(result.easeFactor).toBe(Math.round(expected * 100) / 100);
  });

  it("arredonda o E-Factor para 2 casas decimais", () => {
    const result = calculateSM2(3, 1, 2.5, 1);
    expect(String(result.easeFactor)).toMatch(/^\d+(\.\d{1,2})?$/);
  });
});

describe("processCardReview", () => {
  it("usa valores padrão (EF 2.5) para card novo", () => {
    const review = processCardReview("card-1", "good");
    expect(review.cardId).toBe("card-1");
    expect(review.easeFactor).toBe(2.5);
    expect(review.interval).toBe(1);
    expect(review.repetitions).toBe(1);
    expect(review.difficulty).toBe("good");
  });

  it("considera o histórico da revisão anterior", () => {
    const previous: CardReview = {
      cardId: "card-1",
      quality: 4,
      easeFactor: 2.5,
      interval: 6,
      repetitions: 2,
      nextReviewDate: new Date().toISOString(),
      lastReviewed: new Date().toISOString(),
      difficulty: "good",
    };
    const review = processCardReview("card-1", "good", previous);
    expect(review.repetitions).toBe(3);
    expect(review.interval).toBe(Math.round(6 * review.easeFactor));
  });

  it("registra a data da última revisão", () => {
    const before = Date.now();
    const review = processCardReview("card-1", "easy");
    expect(new Date(review.lastReviewed).getTime()).toBeGreaterThanOrEqual(
      before
    );
  });
});

describe("isCardDue / getDueCards", () => {
  it("card com data passada está due", () => {
    expect(isCardDue(new Date(Date.now() - 1000))).toBe(true);
    expect(isCardDue(new Date(Date.now() + 86_400_000))).toBe(false);
  });

  it("aceita string ISO", () => {
    expect(isCardDue(new Date(Date.now() - 1000).toISOString())).toBe(true);
  });

  it("getDueCards retorna novos cards e os vencidos", () => {
    const cards = [
      { id: 1 }, // novo (sem nextReviewDate)
      { id: 2, nextReviewDate: new Date(Date.now() - 1000).toISOString() },
      { id: 3, nextReviewDate: new Date(Date.now() + 86_400_000).toISOString() },
    ];
    const due = getDueCards(cards);
    expect(due.map((c) => c.id)).toEqual([1, 2]);
  });
});

describe("calculateReviewStats", () => {
  it("retorna zeros para lista vazia", () => {
    const stats = calculateReviewStats([]);
    expect(stats.totalReviews).toBe(0);
    expect(stats.averageEaseFactor).toBe(2.5);
  });

  it("classifica cards em mature/young/new", () => {
    const makeReview = (repetitions: number, easeFactor = 2.5): CardReview => ({
      cardId: `card-${Math.random()}`,
      quality: 4,
      easeFactor,
      interval: repetitions * 6,
      repetitions,
      nextReviewDate: new Date().toISOString(),
      lastReviewed: new Date().toISOString(),
      difficulty: "good",
    });
    const stats = calculateReviewStats([
      makeReview(0),
      makeReview(1),
      makeReview(3),
      makeReview(2, 2.8),
    ]);
    expect(stats.totalReviews).toBe(4);
    expect(stats.newCards).toBe(1);
    expect(stats.youngCards).toBe(1);
    expect(stats.matureCards).toBe(2);
    // média 2.575 arredondada para 2 casas decimais pela função
    expect(stats.averageEaseFactor).toBe(2.58);
  });
});

describe("formatInterval", () => {
  it("formata intervalos curtos", () => {
    expect(formatInterval(0)).toBe("hoje");
    expect(formatInterval(1)).toBe("amanhã");
    expect(formatInterval(5)).toBe("5 dias");
  });

  it("formata semanas, meses e anos", () => {
    expect(formatInterval(14)).toBe("2 semanas");
    expect(formatInterval(60)).toBe("2 meses");
    expect(formatInterval(730)).toBe("2 anos");
  });
});

describe("getIntervalColor", () => {
  it("retorna cores distintas por faixa de intervalo", () => {
    const colors = [
      getIntervalColor(0),
      getIntervalColor(1),
      getIntervalColor(5),
      getIntervalColor(15),
      getIntervalColor(60),
    ];
    expect(new Set(colors).size).toBe(5);
  });
});

describe("initializeCardProgress / calculateNextReview", () => {
  it("inicializa progresso padrão SM-2", () => {
    const progress = initializeCardProgress(0);
    expect(progress.easeFactor).toBe(2.5);
    expect(progress.repetitions).toBe(0);
    expect(progress.nextReviewDate).toBeNull();
  });

  it("calcula a próxima revisão mantendo o cardIndex", () => {
    const progress: CardProgress = initializeCardProgress(3);
    const next = calculateNextReview(progress, "easy");
    expect(next.cardIndex).toBe(3);
    expect(next.difficulty).toBe("easy");
    expect(next.repetitions).toBe(1);
    expect(next.nextReviewDate).toBeInstanceOf(Date);
  });
});
