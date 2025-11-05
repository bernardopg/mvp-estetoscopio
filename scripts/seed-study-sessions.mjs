/**
 * Script para popular dados de exemplo de sessões de estudo
 * Execute: node scripts/seed-study-sessions.mjs
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "mvp-estetoscopio.db");
const db = new Database(dbPath);

console.log("🌱 Populando dados de exemplo de sessões de estudo...\n");

try {
  // Buscar o primeiro usuário
  const user = db.prepare("SELECT * FROM users LIMIT 1").get();

  if (!user) {
    console.log("❌ Nenhum usuário encontrado. Crie um usuário primeiro.");
    process.exit(1);
  }

  console.log(`👤 Usuário encontrado: ${user.name} (ID: ${user.id})\n`);

  // Buscar baralhos do usuário
  const decks = db
    .prepare("SELECT * FROM decks WHERE user_id = ?")
    .all(user.id);

  if (decks.length === 0) {
    console.log("❌ Nenhum baralho encontrado. Crie baralhos primeiro.");
    process.exit(1);
  }

  console.log(`📚 Baralhos encontrados: ${decks.length}\n`);

  // Limpar sessões antigas (opcional)
  const deleted = db
    .prepare("DELETE FROM study_sessions WHERE user_id = ?")
    .run(user.id);
  console.log(`🗑️  Removidas ${deleted.changes} sessões antigas\n`);

  const insertSession = db.prepare(`
    INSERT INTO study_sessions
    (user_id, deck_id, cards_studied, cards_again, cards_hard, cards_good, cards_easy, time_spent, session_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalSessions = 0;

  // Gerar sessões para os últimos 30 dias
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split("T")[0];

    // Determinar se haverá estudo neste dia (80% de chance)
    const willStudy = Math.random() < 0.8;

    if (!willStudy) continue;

    // Número de sessões neste dia (1-3)
    const sessionsPerDay = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < sessionsPerDay; i++) {
      // Escolher um baralho aleatório
      const deck = decks[Math.floor(Math.random() * decks.length)];

      // Gerar dados aleatórios da sessão
      const cardsStudied = Math.floor(Math.random() * 20) + 5; // 5-25 cards
      const timeSpent = Math.floor(Math.random() * 1200) + 300; // 5-20 minutos em segundos

      // Distribuir dificuldade (total = cardsStudied)
      let remaining = cardsStudied;
      const again = Math.floor(remaining * (Math.random() * 0.15)); // 0-15%
      remaining -= again;
      const hard = Math.floor(remaining * (Math.random() * 0.2)); // 0-20%
      remaining -= hard;
      const easy = Math.floor(remaining * (Math.random() * 0.3)); // 0-30%
      const good = remaining - easy; // O resto

      insertSession.run(
        user.id,
        deck.id,
        cardsStudied,
        again,
        hard,
        good,
        easy,
        timeSpent,
        dateStr
      );

      totalSessions++;
    }
  }

  console.log(`✅ Criadas ${totalSessions} sessões de estudo com sucesso!\n`);

  // Mostrar estatísticas
  const stats = db
    .prepare(
      `
    SELECT
      COUNT(DISTINCT session_date) as days_studied,
      SUM(cards_studied) as total_cards,
      AVG(cards_studied) as avg_cards_per_session,
      SUM(time_spent) / 60 as total_minutes
    FROM study_sessions
    WHERE user_id = ?
  `
    )
    .get(user.id);

  console.log("📊 Estatísticas geradas:");
  console.log(`   • Dias estudados: ${stats.days_studied}`);
  console.log(`   • Total de cards estudados: ${stats.total_cards}`);
  console.log(
    `   • Média de cards por sessão: ${Math.round(stats.avg_cards_per_session)}`
  );
  console.log(`   • Tempo total: ${Math.round(stats.total_minutes)} minutos\n`);

  console.log("🎉 Concluído! Acesse /perfil para ver as estatísticas.\n");
} catch (error) {
  console.error("❌ Erro ao popular dados:", error);
  process.exit(1);
} finally {
  db.close();
}
