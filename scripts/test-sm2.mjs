/**
 * Script de teste do algoritmo SM-2
 * Execute: node scripts/test-sm2.mjs
 */

// Implementação inline para testes (cópia de spaced-repetition.ts)
function calculateSM2(quality, repetitions, easeFactor, interval) {
  let newEaseFactor = easeFactor;
  let newRepetitions = repetitions;
  let newInterval = interval;

  // Calcular novo E-Factor usando a fórmula oficial do SM-2
  newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // E-Factor mínimo é 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  // Se quality < 3, resetar repetições
  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions += 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  return {
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    interval: newInterval,
    repetitions: newRepetitions,
  };
}

function difficultyToQuality(difficulty) {
  const qualityMap = {
    again: 0,
    hard: 2,
    good: 4,
    easy: 5,
  };
  return qualityMap[difficulty];
}

function processCardReview(cardId, difficulty, currentReview) {
  const quality = difficultyToQuality(difficulty);
  const easeFactor = currentReview?.easeFactor ?? 2.5;
  const interval = currentReview?.interval ?? 0;
  const repetitions = currentReview?.repetitions ?? 0;

  const result = calculateSM2(quality, repetitions, easeFactor, interval);

  return {
    cardId,
    quality,
    easeFactor: result.easeFactor,
    interval: result.interval,
    repetitions: result.repetitions,
    difficulty,
  };
}

console.log("🧪 Testando Algoritmo SM-2\n");
console.log("=".repeat(60));

// Teste 1: Card novo - primeira revisão "good"
console.log("\n📝 Teste 1: Card novo - primeira revisão 'good'");
console.log("-".repeat(60));
const test1 = calculateSM2(4, 0, 2.5, 0);
console.log("Input: quality=4 (good), reps=0, EF=2.5, interval=0");
console.log("Output:", {
  easeFactor: test1.easeFactor,
  interval: test1.interval,
  repetitions: test1.repetitions,
});
console.log("✓ Esperado: EF=2.5, interval=1, reps=1");
console.log(
  test1.easeFactor === 2.5 && test1.interval === 1 && test1.repetitions === 1
    ? "✅ PASSOU"
    : "❌ FALHOU"
);

// Teste 2: Segunda revisão "good"
console.log("\n📝 Teste 2: Segunda revisão 'good'");
console.log("-".repeat(60));
const test2 = calculateSM2(4, 1, 2.5, 1);
console.log("Input: quality=4 (good), reps=1, EF=2.5, interval=1");
console.log("Output:", {
  easeFactor: test2.easeFactor,
  interval: test2.interval,
  repetitions: test2.repetitions,
});
console.log("✓ Esperado: EF=2.5, interval=6, reps=2");
console.log(
  test2.easeFactor === 2.5 && test2.interval === 6 && test2.repetitions === 2
    ? "✅ PASSOU"
    : "❌ FALHOU"
);

// Teste 3: Terceira revisão "good" (usar fórmula)
console.log(
  "\n📝 Teste 3: Terceira revisão 'good' (fórmula I(n) = I(n-1) * EF)"
);
console.log("-".repeat(60));
const test3 = calculateSM2(4, 2, 2.5, 6);
console.log("Input: quality=4 (good), reps=2, EF=2.5, interval=6");
console.log("Output:", {
  easeFactor: test3.easeFactor,
  interval: test3.interval,
  repetitions: test3.repetitions,
});
console.log("✓ Esperado: EF=2.5, interval=15 (6*2.5), reps=3");
console.log(
  test3.easeFactor === 2.5 && test3.interval === 15 && test3.repetitions === 3
    ? "✅ PASSOU"
    : "❌ FALHOU"
);

// Teste 4: Revisão "easy" (aumenta EF)
console.log("\n📝 Teste 4: Revisão 'easy' (aumenta EF)");
console.log("-".repeat(60));
const test4 = calculateSM2(5, 2, 2.5, 6);
console.log("Input: quality=5 (easy), reps=2, EF=2.5, interval=6");
console.log("Output:", {
  easeFactor: test4.easeFactor,
  interval: test4.interval,
  repetitions: test4.repetitions,
});
console.log("✓ Esperado: EF>2.5, interval>15, reps=3");
console.log(
  test4.easeFactor > 2.5 && test4.interval > 15 && test4.repetitions === 3
    ? "✅ PASSOU"
    : "❌ FALHOU"
);

// Teste 5: Revisão "hard" (diminui EF)
console.log("\n📝 Teste 5: Revisão 'hard' (diminui EF)");
console.log("-".repeat(60));
const test5 = calculateSM2(2, 2, 2.5, 6);
console.log("Input: quality=2 (hard), reps=2, EF=2.5, interval=6");
console.log("Output:", {
  easeFactor: test5.easeFactor,
  interval: test5.interval,
  repetitions: test5.repetitions,
});
console.log("✓ Esperado: EF<2.5, interval<15, reps=3");
console.log(
  test5.easeFactor < 2.5 && test5.interval < 15 && test5.repetitions === 3
    ? "✅ PASSOU"
    : "❌ FALHOU"
);

// Teste 6: Revisão "again" (reseta)
console.log("\n📝 Teste 6: Revisão 'again' (reseta progresso)");
console.log("-".repeat(60));
const test6 = calculateSM2(0, 5, 2.5, 100);
console.log("Input: quality=0 (again), reps=5, EF=2.5, interval=100");
console.log("Output:", {
  easeFactor: test6.easeFactor,
  interval: test6.interval,
  repetitions: test6.repetitions,
});
console.log("✓ Esperado: EF diminui, interval=1, reps=0 (reset)");
console.log(
  test6.easeFactor < 2.5 && test6.interval === 1 && test6.repetitions === 0
    ? "✅ PASSOU"
    : "❌ FALHOU"
);

// Teste 7: EF mínimo (1.3)
console.log("\n📝 Teste 7: EF mínimo (não pode ser < 1.3)");
console.log("-".repeat(60));
const test7 = calculateSM2(0, 0, 1.3, 0);
console.log("Input: quality=0 (again), reps=0, EF=1.3, interval=0");
console.log("Output:", {
  easeFactor: test7.easeFactor,
  interval: test7.interval,
  repetitions: test7.repetitions,
});
console.log("✓ Esperado: EF=1.3 (mínimo), interval=1, reps=0");
console.log(
  test7.easeFactor >= 1.3 && test7.interval === 1 && test7.repetitions === 0
    ? "✅ PASSOU"
    : "❌ FALHOU"
);

// Teste 8: Processamento completo de revisão
console.log("\n📝 Teste 8: Função processCardReview()");
console.log("-".repeat(60));
const review1 = processCardReview("card-001", "good");
console.log("Primeira revisão (good):", {
  interval: review1.interval,
  easeFactor: review1.easeFactor,
  repetitions: review1.repetitions,
});

const review2 = processCardReview("card-001", "good", review1);
console.log("Segunda revisão (good):", {
  interval: review2.interval,
  easeFactor: review2.easeFactor,
  repetitions: review2.repetitions,
});

const review3 = processCardReview("card-001", "easy", review2);
console.log("Terceira revisão (easy):", {
  interval: review3.interval,
  easeFactor: review3.easeFactor,
  repetitions: review3.repetitions,
});

console.log(
  review1.interval === 1 &&
    review2.interval === 6 &&
    review3.interval > 15 &&
    review3.easeFactor > 2.5
    ? "✅ PASSOU"
    : "❌ FALHOU"
);

// Teste 9: Sequência realista de revisões
console.log("\n📝 Teste 9: Sequência realista de revisões");
console.log("-".repeat(60));
let currentReview = processCardReview("card-real", "good");
console.log(
  `1. good → ${currentReview.interval} dias (EF: ${currentReview.easeFactor})`
);

currentReview = processCardReview("card-real", "good", currentReview);
console.log(
  `2. good → ${currentReview.interval} dias (EF: ${currentReview.easeFactor})`
);

currentReview = processCardReview("card-real", "easy", currentReview);
console.log(
  `3. easy → ${currentReview.interval} dias (EF: ${currentReview.easeFactor})`
);

currentReview = processCardReview("card-real", "good", currentReview);
console.log(
  `4. good → ${currentReview.interval} dias (EF: ${currentReview.easeFactor})`
);

currentReview = processCardReview("card-real", "again", currentReview);
console.log(
  `5. again → ${currentReview.interval} dias (EF: ${currentReview.easeFactor}) [RESET]`
);

currentReview = processCardReview("card-real", "hard", currentReview);
console.log(
  `6. hard → ${currentReview.interval} dias (EF: ${currentReview.easeFactor})`
);

console.log("✅ Sequência completa executada");

console.log("\n" + "=".repeat(60));
console.log("✅ Todos os testes do algoritmo SM-2 foram executados!");
console.log("=".repeat(60) + "\n");
