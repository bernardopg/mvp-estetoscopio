# Algoritmo de Repetição Espaçada SM-2

## 📋 Visão Geral

Este projeto implementa o algoritmo **SM-2 (SuperMemo 2)**, um método científico de repetição espaçada desenvolvido por Piotr Woźniak em 1988. O algoritmo calcula intervalos ótimos para revisão de flashcards baseado no desempenho do usuário.

## 🧠 Como Funciona

### Conceitos Principais

1. **E-Factor (Ease Factor)**: Fator de facilidade do card (padrão: 2.5)
   - Varia de 1.3 a infinito
   - Determina o crescimento do intervalo
   - Cards mais fáceis têm E-Factor maior

2. **Intervalo**: Tempo em dias até a próxima revisão
   - Aumenta exponencialmente para respostas corretas
   - Reseta para 1 dia em respostas incorretas

3. **Repetições**: Número de vezes consecutivas que o card foi respondido corretamente (quality ≥ 3)

### Fórmula do E-Factor

```
EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))
```

Onde:

- `EF'` = Novo E-Factor
- `EF` = E-Factor atual
- `q` = Qualidade da resposta (0-5)

### Cálculo de Intervalos

| Repetição | Intervalo |
|-----------|-----------|
| 1ª        | 1 dia     |
| 2ª        | 6 dias    |
| 3ª+       | I(n-1) × EF |

**Exemplo:**

- Repetição 1: 1 dia
- Repetição 2: 6 dias
- Repetição 3: 6 × 2.5 = 15 dias
- Repetição 4: 15 × 2.5 = 38 dias
- E assim por diante...

## 🎯 Níveis de Dificuldade

O sistema usa 4 níveis mapeados para qualidades SM-2:

| Nível  | Quality | Descrição | Efeito |
|--------|---------|-----------|--------|
| `again` | 0 | Resposta incorreta | Reseta repetições, EF diminui muito |
| `hard` | 2 | Correto com dificuldade | Reseta repetições, EF diminui |
| `good` | 4 | Correto sem hesitação | EF mantém, intervalo cresce |
| `easy` | 5 | Resposta perfeita | EF aumenta, intervalo cresce mais |

**Importante:** Apenas respostas com quality ≥ 3 contam como "corretas" e incrementam repetições.

## 📊 Exemplos Práticos

### Exemplo 1: Sequência Ideal (todas "good")

```javascript
Revisão 1: quality=4 → EF=2.5, interval=1 dia,  reps=1
Revisão 2: quality=4 → EF=2.5, interval=6 dias, reps=2
Revisão 3: quality=4 → EF=2.5, interval=15 dias, reps=3
Revisão 4: quality=4 → EF=2.5, interval=38 dias, reps=4
```

### Exemplo 2: Com Erros

```javascript
Revisão 1: quality=4 (good)  → EF=2.5,  interval=1 dia,  reps=1
Revisão 2: quality=4 (good)  → EF=2.5,  interval=6 dias, reps=2
Revisão 3: quality=5 (easy)  → EF=2.6,  interval=16 dias, reps=3
Revisão 4: quality=0 (again) → EF=1.8,  interval=1 dia,  reps=0 ⚠️ RESET
Revisão 5: quality=2 (hard)  → EF=1.48, interval=1 dia,  reps=0 ⚠️ RESET
Revisão 6: quality=4 (good)  → EF=1.48, interval=1 dia,  reps=1
Revisão 7: quality=4 (good)  → EF=1.48, interval=6 dias, reps=2
```

### Exemplo 3: Cards Difíceis vs Fáceis

**Card Difícil (sempre "hard"):**

```javascript
Revisão 1: quality=2 → EF=2.18, interval=1 dia,  reps=0
Revisão 2: quality=2 → EF=1.86, interval=1 dia,  reps=0
Revisão 3: quality=2 → EF=1.54, interval=1 dia,  reps=0
// E-Factor diminui, mas nunca < 1.3
```

**Card Fácil (sempre "easy"):**

```javascript
Revisão 1: quality=5 → EF=2.6,  interval=1 dia,  reps=1
Revisão 2: quality=5 → EF=2.7,  interval=6 dias, reps=2
Revisão 3: quality=5 → EF=2.8,  interval=17 dias, reps=3
Revisão 4: quality=5 → EF=2.9,  interval=49 dias, reps=4
// E-Factor aumenta gradualmente
```

## 🔧 Implementação

### Funções Principais

#### `calculateSM2(quality, repetitions, easeFactor, interval)`

Calcula novo estado do card usando algoritmo SM-2 puro.

```typescript
const result = calculateSM2(
  4,    // quality (0-5)
  1,    // repetitions
  2.5,  // easeFactor
  1     // interval (dias)
);

// result = { easeFactor: 2.5, interval: 6, repetitions: 2 }
```

#### `processCardReview(cardId, difficulty, currentReview?)`

Processa uma revisão completa de um card.

```typescript
// Primeira revisão
const review1 = processCardReview("card-123", "good");

// Próxima revisão (usa estado anterior)
const review2 = processCardReview("card-123", "easy", review1);
```

#### `isCardDue(nextReviewDate)`

Verifica se um card está devido para revisão.

```typescript
const isDue = isCardDue("2025-11-10");
// true se data <= hoje
```

#### `getDueCards(cards)`

Filtra apenas cards devidos de uma lista.

```typescript
const dueCards = getDueCards([
  { id: "1", nextReviewDate: "2025-11-01" },
  { id: "2", nextReviewDate: "2025-12-01" },
  { id: "3" } // novo card (sem nextReviewDate)
]);
// Retorna cards 1 e 3
```

## 📡 API

### POST `/api/decks/[id]/review`

Registra uma revisão de card.

**Request:**

```json
{
  "cardId": "card-123",
  "difficulty": "good"
}
```

**Response:**

```json
{
  "success": true,
  "review": {
    "cardId": "card-123",
    "quality": 4,
    "easeFactor": 2.5,
    "interval": 6,
    "repetitions": 2,
    "nextReviewDate": "2025-11-11",
    "difficulty": "good"
  },
  "message": "Card revisado! Próxima revisão em 6 dias"
}
```

### GET `/api/decks/[id]/review`

Busca estatísticas e cards devidos.

**Response:**

```json
{
  "deckId": 1,
  "totalCards": 50,
  "dueCards": {
    "count": 12,
    "cards": ["card-1", "card-5", "card-8", ...]
  },
  "stats": {
    "reviewed": 38,
    "new": 12,
    "mature": 20,
    "young": 18,
    "avgEaseFactor": 2.35,
    "avgInterval": 8
  }
}
```

## 🗄️ Banco de Dados

### Tabela `card_reviews`

```sql
CREATE TABLE card_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  deck_id INTEGER NOT NULL,
  card_id TEXT NOT NULL,
  quality INTEGER NOT NULL,        -- 0-5
  ease_factor REAL NOT NULL,        -- ≥ 1.3
  interval INTEGER NOT NULL,        -- dias
  repetitions INTEGER NOT NULL,     -- consecutivas
  next_review_date DATE NOT NULL,   -- próxima revisão
  difficulty TEXT NOT NULL,         -- again|hard|good|easy
  review_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📈 Estatísticas

O sistema categoriza cards em:

- **New**: Nunca foram revisados
- **Young**: Revisados 1 vez (repetitions = 1)
- **Mature**: Revisados 2+ vezes (repetitions ≥ 2)

Cards maduros tendem a ter:

- E-Factor otimizado (próximo ao desempenho real)
- Intervalos maiores (revisões menos frequentes)
- Melhor taxa de retenção

## 🧪 Testes

Execute os testes do algoritmo:

```bash
node scripts/test-sm2.mjs
```

## 📚 Referências

- [SuperMemo 2 Algorithm](https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method)
- [Implementação Original (1988)](https://super-memory.com/english/ol/sm2.htm)
- [Spaced Repetition Research](https://www.gwern.net/Spaced-repetition)

## ⚖️ Licença

Implementado conforme especificação pública do algoritmo SM-2.
