# 📝 Configuração do Wiki Sync

O workflow `wiki-sync.yml` sincroniza automaticamente a documentação de `docs/` para o GitHub Wiki.

## ⚠️ Status Atual

**❌ FALHANDO** - Secret `WIKI_PAT` não configurado

## 🔧 Como Corrigir

### Passo 1: Criar Personal Access Token (PAT)

1. Acesse: <https://github.com/settings/tokens/new>
2. Configure o token:
   - **Nome**: `Wiki Sync Token`
   - **Expiration**: Escolha a duração (recomendado: 1 ano)
   - **Scopes**: Marque **✅ `repo`** (Full control of private repositories)
3. Clique em **"Generate token"**
4. **⚠️ IMPORTANTE**: Copie o token (ele só será mostrado uma vez!)

### Passo 2: Adicionar Secret no Repositório

1. Acesse: <https://github.com/bernardopg/mvp-estetoscopio/settings/secrets/actions>
2. Clique em **"New repository secret"**
3. Configure:
   - **Name**: `WIKI_PAT`
   - **Secret**: Cole o token copiado no Passo 1
4. Clique em **"Add secret"**

### Passo 3: Habilitar Wiki (se necessário)

1. Vá em: <https://github.com/bernardopg/mvp-estetoscopio/settings>
2. Na seção **Features**, marque ✅ **Wikis**

### Passo 4: Testar

Faça um push de qualquer arquivo em `docs/` para disparar o workflow:

```bash
# Exemplo: editar qualquer .md em docs/
git add docs/
git commit -m "docs: test wiki sync"
git push
```

Ou execute manualmente:

- Vá em: <https://github.com/bernardopg/mvp-estetoscopio/actions/workflows/wiki-sync.yml>
- Clique em **"Run workflow"**

## 📊 O Que o Workflow Faz

1. Copia arquivos `.md` de `docs/user/`, `docs/developer/`, `docs/maintainer/`, `docs/releases/`
2. Cria estrutura de pastas no wiki
3. Gera `_Sidebar.md` com navegação
4. Adiciona `_SOURCE.md` explicando a origem dos arquivos
5. Faz commit e push automático para o repositório `.wiki`

## 🔒 Segurança

- O token PAT tem acesso completo ao repositório
- Guarde-o em local seguro
- Não compartilhe o token com ninguém
- Se comprometido, revogar token em: <https://github.com/settings/tokens>

## ❓ Troubleshooting

### Erro: "Permission denied"

- Verifique se o secret `WIKI_PAT` está configurado corretamente
- Confirme que o token tem scope `repo` habilitado
- Verifique se o token não expirou

### Erro: "Wiki not found"

- Habilite Wiki nas configurações do repositório
- Crie pelo menos uma página inicial no wiki manualmente

### Workflow não dispara

- Verifique se os arquivos modificados estão em `docs/**/*.md` ou `docs/**/*.mdx`
- Confirme que o push foi feito para a branch `main`

## 🚫 Desabilitar Sync Automático

Se não quiser sincronizar a wiki automaticamente, você pode:

1. **Remover o workflow**:

   ```bash
   rm .github/workflows/wiki-sync.yml
   git add .github/workflows/wiki-sync.yml
   git commit -m "chore: remove wiki sync workflow"
   git push
   ```

2. **Ou desabilitar temporariamente**:

   - Vá em: <https://github.com/bernardopg/mvp-estetoscopio/actions/workflows/wiki-sync.yml>
   - Clique no menu "..." → **"Disable workflow"**

---

**Última atualização**: 2025-11-05
**Status**: Aguardando configuração do WIKI_PAT
