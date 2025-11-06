#!/usr/bin/env node

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "mvp-estetoscopio.db");

console.log("🔍 Testando schema do banco de dados...\n");

const db = new Database(dbPath);

// Verificar tabelas existentes
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all();

console.log("📋 Tabelas encontradas:");
tables.forEach((table) => {
  console.log(`  ✓ ${table.name}`);
});

// Verificar colunas da tabela decks
console.log("\n📊 Colunas da tabela 'decks':");
const deckColumns = db.prepare("PRAGMA table_info(decks)").all();
deckColumns.forEach((col) => {
  console.log(`  ✓ ${col.name} (${col.type})${col.notnull ? " NOT NULL" : ""}`);
});

// Verificar colunas da tabela folders
console.log("\n📁 Colunas da tabela 'folders':");
const folderColumns = db.prepare("PRAGMA table_info(folders)").all();
folderColumns.forEach((col) => {
  console.log(`  ✓ ${col.name} (${col.type})${col.notnull ? " NOT NULL" : ""}`);
});

// Verificar colunas da tabela tags
console.log("\n🏷️  Colunas da tabela 'tags':");
const tagColumns = db.prepare("PRAGMA table_info(tags)").all();
tagColumns.forEach((col) => {
  console.log(`  ✓ ${col.name} (${col.type})${col.notnull ? " NOT NULL" : ""}`);
});

// Verificar colunas da tabela deck_tags
console.log("\n🔗 Colunas da tabela 'deck_tags':");
const deckTagsColumns = db.prepare("PRAGMA table_info(deck_tags)").all();
deckTagsColumns.forEach((col) => {
  console.log(`  ✓ ${col.name} (${col.type})${col.notnull ? " NOT NULL" : ""}`);
});

// Verificar índices
console.log("\n🔍 Índices criados:");
const indexes = db
  .prepare(
    "SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name"
  )
  .all();
indexes.forEach((idx) => {
  console.log(`  ✓ ${idx.name} (tabela: ${idx.tbl_name})`);
});

// Verificar foreign keys da tabela decks
console.log("\n🔗 Foreign Keys da tabela 'decks':");
const decksFKs = db.prepare("PRAGMA foreign_key_list(decks)").all();
decksFKs.forEach((fk) => {
  console.log(`  ✓ ${fk.from} -> ${fk.table}.${fk.to}`);
});

db.close();

console.log("\n✅ Teste de schema concluído!");
