# 🚀 Guia Rápido: Release Manager Agent

## Como Usar o Release Manager Agent

### Passo 1: Inicie a Conversa

Copie e cole este prompt no chat com Claude/GPT:

```
Você é o Release Manager Agent do MVP Estetoscópio.

Leia primeiro:
1. /CLAUDE.md - Contexto completo do projeto
2. /AGENTS.md - Suas responsabilidades e workflow
3. /CHANGELOG.md - Última versão publicada

Depois, prepare a release da próxima versão seguindo TODO o workflow documentado.
```

### Passo 2: Forneça Contexto das Mudanças

```
As seguintes mudanças foram implementadas desde a última release:

Features:
- [ ] Nova funcionalidade X
- [ ] Nova funcionalidade Y

Fixes:
- [ ] Correção de bug Z

Improvements:
- [ ] Melhoria A
- [ ] Melhoria B

Determine a versão apropriada (MAJOR.MINOR.PATCH) e execute todas as etapas.
```

### Passo 3: O Agente Irá Executar

O Release Manager Agent seguirá estas etapas automaticamente:

#### 1. Análise de Mudanças ✅
- Lista todos os commits desde última release
- Categoriza por tipo (feat, fix, docs, etc)
- Determina tipo de versão
- Identifica breaking changes

#### 2. Atualiza Documentação Markdown ✅
- `README.md` - Características, tecnologias, estrutura
- `CHANGELOG.md` - Nova seção com mudanças categorizadas
- `package.json` - Incrementa versão
- `ARQUITETURA.md` - APIs e componentes novos
- Outros .md - Conforme necessário

#### 3. Sincroniza Documentação MDX ✅
- `docs/index.mdx` - Versão e novidades
- `docs/changelog.mdx` - Sincroniza com CHANGELOG.md
- `docs/api.mdx` - Novos endpoints
- `docs/arquitetura.mdx` - Sincroniza com ARQUITETURA.md
- Valida componentes MDX

#### 4. Cria Release Notes ✅
- Gera `RELEASE_NOTES_vX.Y.Z.md`
- Inclui resumo, features, melhorias, fixes
- Estatísticas da versão
- Guia de migração (se necessário)

#### 5. Prepara Versionamento Git ✅
- Cria commit seguindo Conventional Commits
- Cria tag anotada com descrição completa
- Fornece comandos para push

#### 6. Fornece Instruções ✅
- Como criar release no GitHub
- Checklist de verificação
- Próximos passos

### Exemplo Completo

**Input:**
```
Prepare release v1.2.0 incluindo:

Features:
- Sistema de estatísticas avançadas com gráficos
- Página de perfil completa com edição
- Sistema de recuperação de senha por email

Fixes:
- Correção no upload de arquivos grandes
- Fix no sistema de autenticação

Improvements:
- Interface mais responsiva
- Melhor performance no carregamento
```

**Output Esperado:**

1. ✅ Análise: "Versão 1.2.0 (MINOR) - 3 features, 2 fixes, 2 improvements"
2. ✅ Atualiza 9 arquivos .md
3. ✅ Sincroniza 8 arquivos .mdx
4. ✅ Cria RELEASE_NOTES_v1.2.0.md
5. ✅ Prepara commit e tag
6. ✅ Fornece instruções completas

### Comandos Git Fornecidos

O agente fornecerá comandos prontos:

```bash
# Adicionar arquivos
git add README.md CHANGELOG.md package.json docs/*.mdx ...

# Commit
git commit -m "chore: release v1.2.0

✨ Features:
- Sistema de estatísticas avançadas
- Página de perfil completa
- Recuperação de senha

🐛 Fixes:
- Upload de arquivos grandes
- Sistema de autenticação

🔄 Improvements:
- Interface responsiva
- Performance melhorada

📊 Metrics:
- 6 componentes (+1)
- 17 páginas (+2)
- 13 endpoints (+2)
- ~5.000 LOC (+500)
"

# Criar tag
git tag -a v1.2.0 -m "Release v1.2.0 - Sistema de Estatísticas

[Descrição completa...]
"

# Push
git push origin main
git push origin v1.2.0
```

## Checklist de Validação

Após o agente executar, verifique:

### Documentação
- [ ] README.md tem todas as features mencionadas
- [ ] CHANGELOG.md tem seção nova com data atual
- [ ] package.json tem versão correta
- [ ] Todos os .md relevantes foram atualizados

### MDX
- [ ] docs/*.mdx estão sincronizados com .md
- [ ] docs/index.mdx tem versão atual
- [ ] docs/changelog.mdx reflete CHANGELOG.md
- [ ] Links internos funcionando

### Release
- [ ] RELEASE_NOTES_vX.Y.Z.md foi criado
- [ ] Versões consistentes em todos os arquivos
- [ ] Métricas calculadas e documentadas
- [ ] Breaking changes documentados (se houver)

### Git
- [ ] Commit criado com mensagem adequada
- [ ] Tag criada com descrição completa
- [ ] Pronto para push

## Dicas

### ✅ DO's

- **Sempre** forneça contexto completo das mudanças
- **Sempre** revise os arquivos gerados antes de commitar
- **Sempre** valide links e sintaxe
- **Sempre** teste a build após atualizar

### ❌ DON'Ts

- **Nunca** pule etapas do workflow
- **Nunca** esqueça de sincronizar .md ↔ .mdx
- **Nunca** publique sem revisar o CHANGELOG
- **Nunca** esqueça de atualizar a data

## Problemas Comuns

### "Versões inconsistentes"
**Solução**: Execute o agente novamente pedindo para verificar e corrigir todas as versões

### "Links quebrados na documentação"
**Solução**: Peça ao agente para validar e corrigir todos os links

### "MDX não sincronizado com MD"
**Solução**: Peça ao agente para refazer a sincronização completa

### "Faltam métricas"
**Solução**: Peça ao agente para calcular e incluir todas as métricas

## Próximos Passos Após Release

1. **Criar Release no GitHub**
   - Acesse: https://github.com/seu-user/mvp-estetoscopio/releases
   - Clique em "Draft a new release"
   - Selecione a tag vX.Y.Z
   - Copie conteúdo de RELEASE_NOTES_vX.Y.Z.md
   - Publique

2. **Anunciar**
   - Atualizar README principal
   - Postar em redes sociais (se aplicável)
   - Notificar equipe/usuários

3. **Planejar Próxima Versão**
   - Atualizar seção [Unreleased] no CHANGELOG
   - Atualizar Roadmap no README
   - Criar issues para próximas features

## Recursos

- **[AGENTS.md](../AGENTS.md)** - Documentação completa do agente
- **[CLAUDE.md](../CLAUDE.md)** - Contexto do projeto
- **[CHANGELOG.md](../CHANGELOG.md)** - Histórico de versões
- **[.github/RELEASE_GUIDE.md](../.github/RELEASE_GUIDE.md)** - Guia de releases

---

**Versão**: 1.0.0  
**Última Atualização**: 05/11/2025

---

## TL;DR

```bash
# 1. Inicie o agente
"Você é o Release Manager Agent. Leia /CLAUDE.md e /AGENTS.md. 
Prepare release v1.X.0 com estas mudanças: [liste mudanças]"

# 2. Revise os arquivos gerados

# 3. Execute os comandos git fornecidos

# 4. Crie release no GitHub

# Done! 🎉
```
