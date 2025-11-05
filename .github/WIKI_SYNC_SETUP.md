# Configuração do Wiki Sync

## Status Atual

✅ **HABILITADO** - O workflow está configurado e funcionando com o secret `WIKI_PAT`.

O sync automático está ativo e será executado sempre que houver push na branch `main` que modifique arquivos em `docs/`.

## Como Funciona

O workflow `wiki-sync.yml` sincroniza automaticamente a documentação de `docs/` para o repositório wiki sempre que há alterações.

### Triggers

- **Push automático**: Qualquer commit na branch `main` que modifique arquivos em `docs/`
- **Manual**: Pode ser executado manualmente via Actions tab

### Secret Configurado

- **Nome**: `WIKI_PAT`
- **Tipo**: Personal Access Token (Classic)
- **Permissões**: Acesso completo ao repositório (`repo` scope)

## Reconfigurar o Token (Se Necessário)

Caso o token expire ou precise ser regenerado:

1. Acesse: <https://github.com/settings/tokens>
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Configure o token:
   - **Note**: `Wiki Sync Token`
   - **Expiration**: Escolha a duração (recomendado: 1 ano ou sem expiração)
   - **Scopes**: Marque **`repo`** (acesso completo ao repositório)
4. Clique em **"Generate token"**
5. **IMPORTANTE**: Copie o token imediatamente (você não poderá vê-lo novamente)
6. Vá para: <https://github.com/bernardopg/mvp-estetoscopio/settings/secrets/actions>
7. Edite o secret `WIKI_PAT` e atualize com o novo token

## Desabilitar o Sync Automático

Se precisar desabilitar temporariamente:

1. Edite `.github/workflows/wiki-sync.yml`
2. Comente o bloco `on: push:` e mantenha apenas `workflow_dispatch:`
3. Faça commit e push

## Executar Manualmente

Você pode executar o sync manualmente de duas formas:

### Via GitHub Actions UI

1. Acesse: <https://github.com/bernardopg/mvp-estetoscopio/actions/workflows/wiki-sync.yml>
2. Clique em **"Run workflow"**
3. Selecione a branch `main`
4. Clique em **"Run workflow"**

### Via Script Local

```bash
# Na raiz do projeto
./scripts/sync-wiki.sh
```

Isso copiará os arquivos de `docs/` para `wiki/` localmente. Você precisará fazer commit e push manualmente no repositório wiki.

## Estrutura de Sincronização

- `docs/user/*.md` → `wiki/user/`
- `docs/developer/*.md` → `wiki/developer/`
- `docs/maintainer/*.md` → `wiki/maintainer/`
- `docs/releases/*.md` → `wiki/releases/`
- `docs/README.md` → `wiki/Home.md`

**Observação**: Arquivos MDX (`docs/*.mdx`) não são copiados para a wiki, pois são usados apenas no site Next.js.

## Segurança

- O PAT deve ter **apenas** o scope `repo`
- Configure expiração adequada (evite tokens permanentes em produção)
- Nunca commite o token no código (use apenas GitHub Secrets)
- Considere usar Fine-grained tokens (beta) para permissões mais restritas

## Referências

- [GitHub Actions: Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Actions: Using secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
