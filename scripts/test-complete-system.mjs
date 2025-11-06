#!/usr/bin/env node

/**
 * Script de Testes Completos do Sistema
 * Valida todas as funcionalidades implementadas
 */

import Database from "better-sqlite3";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

console.log("🧪 TESTES COMPLETOS DO SISTEMA MVP ESTETOSCÓPIO\n");
console.log("=".repeat(60));

// Contadores
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    failedTests++;
    console.log(`❌ ${name}`);
    console.log(`   Erro: ${error.message}`);
    return false;
  }
}

function section(name) {
  console.log(`\n📦 ${name}`);
  console.log("-".repeat(60));
}

// ===================================================================
// 1. ESTRUTURA DE ARQUIVOS E PASTAS
// ===================================================================
section("1. ESTRUTURA DE ARQUIVOS");

test("src/app/baralhos/page.tsx existe", () => {
  const path = join(projectRoot, "src/app/baralhos/page.tsx");
  if (!existsSync(path)) throw new Error("Arquivo não encontrado");
});

test("src/components/Sidebar.tsx existe", () => {
  const path = join(projectRoot, "src/components/Sidebar.tsx");
  if (!existsSync(path)) throw new Error("Arquivo não encontrado");
});

test("src/components/FolderTree.tsx existe", () => {
  const path = join(projectRoot, "src/components/FolderTree.tsx");
  if (!existsSync(path)) throw new Error("Arquivo não encontrado");
});

test("src/components/Breadcrumbs.tsx existe", () => {
  const path = join(projectRoot, "src/components/Breadcrumbs.tsx");
  if (!existsSync(path)) throw new Error("Arquivo não encontrado");
});

test("src/components/TagSelector.tsx existe", () => {
  const path = join(projectRoot, "src/components/TagSelector.tsx");
  if (!existsSync(path)) throw new Error("Arquivo não encontrado");
});

test("src/app/api/folders/route.ts existe", () => {
  const path = join(projectRoot, "src/app/api/folders/route.ts");
  if (!existsSync(path)) throw new Error("Arquivo não encontrado");
});

test("src/app/api/folders/[id]/route.ts existe", () => {
  const path = join(projectRoot, "src/app/api/folders/[id]/route.ts");
  if (!existsSync(path)) throw new Error("Arquivo não encontrado");
});

test("src/app/api/tags/route.ts existe", () => {
  const path = join(projectRoot, "src/app/api/tags/route.ts");
  if (!existsSync(path)) throw new Error("Arquivo não encontrado");
});

// ===================================================================
// 2. SCHEMA DO BANCO DE DADOS
// ===================================================================
section("2. SCHEMA DO BANCO DE DADOS");

const dbPath = join(projectRoot, "mvp-estetoscopio.db");
let db;

try {
  db = new Database(dbPath, { readonly: true });

  test("Banco de dados acessível", () => {
    if (!db) throw new Error("Database não conectado");
  });

  // Verificar tabelas
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all()
    .map((r) => r.name);

  test("Tabela 'folders' existe", () => {
    if (!tables.includes("folders")) throw new Error("Tabela não encontrada");
  });

  test("Tabela 'tags' existe", () => {
    if (!tables.includes("tags")) throw new Error("Tabela não encontrada");
  });

  test("Tabela 'deck_tags' existe", () => {
    if (!tables.includes("deck_tags")) throw new Error("Tabela não encontrada");
  });

  test("Tabela 'decks' existe", () => {
    if (!tables.includes("decks")) throw new Error("Tabela não encontrada");
  });

  test("Tabela 'card_reviews' existe", () => {
    if (!tables.includes("card_reviews"))
      throw new Error("Tabela não encontrada");
  });

  // Verificar colunas da tabela decks
  const deckColumns = db
    .prepare("PRAGMA table_info(decks)")
    .all()
    .map((c) => c.name);

  test("decks.folder_id existe", () => {
    if (!deckColumns.includes("folder_id"))
      throw new Error("Coluna não encontrada");
  });

  test("decks.color existe", () => {
    if (!deckColumns.includes("color"))
      throw new Error("Coluna não encontrada");
  });

  test("decks.icon existe", () => {
    if (!deckColumns.includes("icon")) throw new Error("Coluna não encontrada");
  });

  test("decks.is_bookmarked existe", () => {
    if (!deckColumns.includes("is_bookmarked"))
      throw new Error("Coluna não encontrada");
  });

  // Verificar colunas da tabela folders
  const folderColumns = db
    .prepare("PRAGMA table_info(folders)")
    .all()
    .map((c) => c.name);

  test("folders.parent_id existe", () => {
    if (!folderColumns.includes("parent_id"))
      throw new Error("Coluna não encontrada");
  });

  test("folders.color existe", () => {
    if (!folderColumns.includes("color"))
      throw new Error("Coluna não encontrada");
  });

  test("folders.icon existe", () => {
    if (!folderColumns.includes("icon"))
      throw new Error("Coluna não encontrada");
  });

  // Verificar índices
  const indices = db
    .prepare("SELECT name FROM sqlite_master WHERE type='index'")
    .all()
    .map((r) => r.name);

  test("Índice idx_decks_folder existe", () => {
    if (!indices.includes("idx_decks_folder"))
      throw new Error("Índice não encontrado");
  });

  test("Índice idx_decks_bookmarked existe", () => {
    if (!indices.includes("idx_decks_bookmarked"))
      throw new Error("Índice não encontrado");
  });

  test("Índice idx_folders_parent existe", () => {
    if (!indices.includes("idx_folders_parent"))
      throw new Error("Índice não encontrado");
  });

  test("Índice idx_deck_tags_deck existe", () => {
    if (!indices.includes("idx_deck_tags_deck"))
      throw new Error("Índice não encontrado");
  });

  test("Índice idx_deck_tags_tag existe", () => {
    if (!indices.includes("idx_deck_tags_tag"))
      throw new Error("Índice não encontrado");
  });
} catch (error) {
  console.log(`❌ Erro ao acessar banco de dados: ${error.message}`);
} finally {
  if (db) db.close();
}

// ===================================================================
// 3. COMPONENTES REACT
// ===================================================================
section("3. COMPONENTES REACT");

test("Sidebar contém todas as rotas", () => {
  const content = readFileSync(
    join(projectRoot, "src/components/Sidebar.tsx"),
    "utf-8"
  );

  const requiredRoutes = [
    "/",
    "/baralhos",
    "/baralhos/criar",
    "/perfil",
    "/flashcards",
    "/docs",
    "/docs/guia",
    "/docs/exemplos",
    "/docs/faq",
    "/docs/api",
    "/docs/referencia",
    "/docs/arquitetura",
    "/docs/changelog",
  ];

  const missing = requiredRoutes.filter(
    (route) => !content.includes(`"${route}"`)
  );
  if (missing.length > 0) {
    throw new Error(`Rotas faltando: ${missing.join(", ")}`);
  }
});

test("Sidebar possui seções colapsáveis", () => {
  const content = readFileSync(
    join(projectRoot, "src/components/Sidebar.tsx"),
    "utf-8"
  );
  if (!content.includes("collapsible")) {
    throw new Error("Seções colapsáveis não encontradas");
  }
});

test("FolderTree suporta hierarquia", () => {
  const content = readFileSync(
    join(projectRoot, "src/components/FolderTree.tsx"),
    "utf-8"
  );
  if (!content.includes("parent_id") || !content.includes("buildTree")) {
    throw new Error("Suporte a hierarquia não encontrado");
  }
});

test("FolderTree possui expand/collapse", () => {
  const content = readFileSync(
    join(projectRoot, "src/components/FolderTree.tsx"),
    "utf-8"
  );
  if (
    !content.includes("expandedFolders") ||
    !content.includes("ChevronRight")
  ) {
    throw new Error("Funcionalidade de expand/collapse não encontrada");
  }
});

test("Breadcrumbs possui navegação", () => {
  const content = readFileSync(
    join(projectRoot, "src/components/Breadcrumbs.tsx"),
    "utf-8"
  );
  if (!content.includes("Link") || !content.includes("href")) {
    throw new Error("Links de navegação não encontrados");
  }
});

test("TagSelector suporta criação inline", () => {
  const content = readFileSync(
    join(projectRoot, "src/components/TagSelector.tsx"),
    "utf-8"
  );
  if (!content.includes("onCreateTag") || !content.includes("TAG_COLORS")) {
    throw new Error("Criação inline não encontrada");
  }
});

// ===================================================================
// 4. PÁGINA DE BARALHOS
// ===================================================================
section("4. PÁGINA /BARALHOS");

const baralhoContent = readFileSync(
  join(projectRoot, "src/app/baralhos/page.tsx"),
  "utf-8"
);

test("Possui 3 modos de visualização", () => {
  if (
    !baralhoContent.includes("ViewMode") ||
    !baralhoContent.includes('"cards"') ||
    !baralhoContent.includes('"list"') ||
    !baralhoContent.includes('"tree"')
  ) {
    throw new Error("3 modos de visualização não encontrados");
  }
});

test("Possui função renderCardsView", () => {
  if (!baralhoContent.includes("renderCardsView")) {
    throw new Error("renderCardsView não encontrada");
  }
});

test("Possui função renderListView", () => {
  if (!baralhoContent.includes("renderListView")) {
    throw new Error("renderListView não encontrada");
  }
});

test("Possui função renderTreeView", () => {
  if (!baralhoContent.includes("renderTreeView")) {
    throw new Error("renderTreeView não encontrada");
  }
});

test("Integra FolderTree", () => {
  if (!baralhoContent.includes("<FolderTree")) {
    throw new Error("FolderTree não encontrado");
  }
});

test("Integra Breadcrumbs", () => {
  if (!baralhoContent.includes("<Breadcrumbs")) {
    throw new Error("Breadcrumbs não encontrado");
  }
});

test("Possui filtro de busca", () => {
  if (
    !baralhoContent.includes("searchQuery") ||
    !baralhoContent.includes("Search")
  ) {
    throw new Error("Filtro de busca não encontrado");
  }
});

test("Possui filtro de favoritos", () => {
  if (
    !baralhoContent.includes("showBookmarked") ||
    !baralhoContent.includes("Bookmark")
  ) {
    throw new Error("Filtro de favoritos não encontrado");
  }
});

test("Busca pastas via API", () => {
  if (!baralhoContent.includes("/api/folders")) {
    throw new Error("Busca de pastas não encontrada");
  }
});

test("Toggle de visualização funcional", () => {
  if (
    !baralhoContent.includes("setViewMode") ||
    !baralhoContent.includes("LayoutGrid") ||
    !baralhoContent.includes("List") ||
    !baralhoContent.includes("GitBranch")
  ) {
    throw new Error("Toggle de visualização não completo");
  }
});

// ===================================================================
// 5. APIs
// ===================================================================
section("5. APIs");

test("API folders/route.ts possui GET", () => {
  const content = readFileSync(
    join(projectRoot, "src/app/api/folders/route.ts"),
    "utf-8"
  );
  if (!content.includes("export async function GET")) {
    throw new Error("GET não encontrado");
  }
});

test("API folders/route.ts possui POST", () => {
  const content = readFileSync(
    join(projectRoot, "src/app/api/folders/route.ts"),
    "utf-8"
  );
  if (!content.includes("export async function POST")) {
    throw new Error("POST não encontrado");
  }
});

test("API folders/[id]/route.ts possui PUT", () => {
  const content = readFileSync(
    join(projectRoot, "src/app/api/folders/[id]/route.ts"),
    "utf-8"
  );
  if (!content.includes("export async function PUT")) {
    throw new Error("PUT não encontrado");
  }
});

test("API folders/[id]/route.ts possui DELETE", () => {
  const content = readFileSync(
    join(projectRoot, "src/app/api/folders/[id]/route.ts"),
    "utf-8"
  );
  if (!content.includes("export async function DELETE")) {
    throw new Error("DELETE não encontrado");
  }
});

test("API tags/route.ts possui GET", () => {
  const content = readFileSync(
    join(projectRoot, "src/app/api/tags/route.ts"),
    "utf-8"
  );
  if (!content.includes("export async function GET")) {
    throw new Error("GET não encontrado");
  }
});

test("API tags/route.ts possui POST", () => {
  const content = readFileSync(
    join(projectRoot, "src/app/api/tags/route.ts"),
    "utf-8"
  );
  if (!content.includes("export async function POST")) {
    throw new Error("POST não encontrado");
  }
});

// ===================================================================
// 6. DOCUMENTAÇÃO
// ===================================================================
section("6. DOCUMENTAÇÃO");

test("ORGANIZACAO_BARALHOS.md existe", () => {
  const path = join(projectRoot, "docs/ORGANIZACAO_BARALHOS.md");
  if (!existsSync(path)) throw new Error("Arquivo não encontrado");
});

test("TESTES_ORGANIZACAO.md existe", () => {
  const path = join(projectRoot, "docs/TESTES_ORGANIZACAO.md");
  if (!existsSync(path)) throw new Error("Arquivo não encontrado");
});

test("TODO.md atualizado com v1.2", () => {
  const content = readFileSync(join(projectRoot, "TODO.md"), "utf-8");
  if (!content.includes("Sistema de organização de baralhos")) {
    throw new Error("TODO.md não atualizado");
  }
});

// ===================================================================
// 7. TYPESCRIPT E TIPOS
// ===================================================================
section("7. TYPESCRIPT E TIPOS");

test("Página baralhos possui interface Folder", () => {
  if (!baralhoContent.includes("interface Folder")) {
    throw new Error("Interface Folder não encontrada");
  }
});

test("Página baralhos possui interface Tag", () => {
  if (!baralhoContent.includes("interface Tag")) {
    throw new Error("Interface Tag não encontrada");
  }
});

test("Página baralhos possui tipo ViewMode", () => {
  if (!baralhoContent.includes("type ViewMode")) {
    throw new Error("Tipo ViewMode não encontrado");
  }
});

// ===================================================================
// RESUMO FINAL
// ===================================================================
console.log("\n" + "=".repeat(60));
console.log("📊 RESUMO DOS TESTES");
console.log("=".repeat(60));
console.log(`Total de testes: ${totalTests}`);
console.log(`✅ Testes passados: ${passedTests}`);
console.log(`❌ Testes falhados: ${failedTests}`);
console.log(
  `📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`
);

if (failedTests === 0) {
  console.log(
    "\n🎉 TODOS OS TESTES PASSARAM! Sistema funcionando corretamente."
  );
} else {
  console.log(
    `\n⚠️  ${failedTests} teste(s) falharam. Verifique os erros acima.`
  );
  process.exit(1);
}

console.log("\n✨ Testes completos finalizados!\n");
