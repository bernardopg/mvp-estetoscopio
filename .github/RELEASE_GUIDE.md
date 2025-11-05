# 🚀 Guia para Criar a Release no GitHub

## Passos para criar a Release v1.1.0

### 1. Acessar a página de Releases

1. Vá para: <https://github.com/bernardopg/mvp-estetoscopio/releases>
2. Clique em **"Draft a new release"** ou **"Create a new release"**

### 2. Configurar a Release

**Tag version**: `v1.1.0` (já foi criada e enviada)

**Release title**: `🎉 v1.1.0 - Sistema de Documentação MDX`

**Description**: Copie o conteúdo do arquivo `RELEASE_NOTES_v1.1.0.md`

### 3. Opções Adicionais

- ✅ Marque **"Set as the latest release"**
- ⬜ NÃO marque "Set as a pre-release" (esta é uma release estável)

### 4. Publicar

Clique em **"Publish release"**

---

## 📋 Versionamento Semântico (Semantic Versioning)

O projeto segue o padrão **Semantic Versioning 2.0.0** (semver.org):

### Formato: MAJOR.MINOR.PATCH

- **MAJOR** (1.x.x): Mudanças incompatíveis com versões anteriores (breaking changes)
- **MINOR** (x.1.x): Novas funcionalidades compatíveis com versões anteriores
- **PATCH** (x.x.1): Correções de bugs compatíveis

### Exemplos de Versionamento

#### v1.0.0 (Initial Release)

- ✅ Primeira versão estável do projeto
- Sistema básico de flashcards
- Autenticação e gestão de baralhos

#### v1.1.0 (Current)

- ✅ Novas features (MDX, MarkdownRenderer, repetição espaçada)
- ✅ Melhorias nos componentes existentes
- ✅ Compatível com v1.0.0

#### v1.2.0 (Next Minor)

- Estatísticas avançadas
- Perfil completo
- Recuperação de senha
- Compatível com v1.1.0

#### v2.0.0 (Next Major)

- Mudança de SQLite para PostgreSQL
- Novo sistema de autenticação
- API completamente redesenhada
- ⚠️ Pode ter breaking changes

---

## 🏷️ Convenções de Tags

### Tags de Versão

- `v1.0.0` - Release estável
- `v1.1.0-rc.1` - Release Candidate
- `v1.1.0-beta.1` - Beta
- `v1.1.0-alpha.1` - Alpha

### Commits Convencionais

Usamos o padrão **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, ponto e vírgula, etc
- `refactor`: Refatoração de código
- `perf`: Melhorias de performance
- `test`: Adição de testes
- `chore`: Tarefas de manutenção
- `ci`: Mudanças em CI/CD
- `build`: Mudanças no sistema de build

#### Exemplos

```bash
feat(docs): add MDX documentation system
fix(auth): correct JWT token expiration
docs(readme): update installation instructions
chore(release): bump version to 1.1.0
```

---

## 📊 Checklist de Release

### Pré-Release

- [x] Todos os testes passando
- [x] Documentação atualizada (README.md, CHANGELOG.md)
- [x] Version bumped no package.json
- [x] Commit com mensagem descritiva
- [x] Tag criada e enviada

### Release no GitHub

- [ ] Acessar página de releases
- [ ] Criar nova release com a tag v1.1.0
- [ ] Adicionar título e descrição (RELEASE_NOTES)
- [ ] Marcar como latest release
- [ ] Publicar release

### Pós-Release

- [ ] Verificar se a release aparece corretamente
- [ ] Atualizar links de documentação (se necessário)
- [ ] Anunciar a release (redes sociais, fórum, etc)
- [ ] Criar milestone para próxima versão (v1.2.0)

---

## 🔄 Workflow de Versionamento

### Branch Strategy

```
main (production)
  ↓
develop (development)
  ↓
feature/* (features)
hotfix/* (urgent fixes)
release/* (release preparation)
```

### Release Flow

1. **Development**: Desenvolver features na branch `develop`
2. **Feature Complete**: Quando features estão prontas, criar branch `release/v1.x.0`
3. **Testing**: Testar e corrigir bugs na branch de release
4. **Tag**: Criar tag vX.Y.Z
5. **Merge**: Merge para `main` e `develop`
6. **Publish**: Publicar release no GitHub
7. **Deploy**: Deploy automático (se configurado)

---

## 🎯 Roadmap de Versões

### v1.1.0 ✅ (Atual)

- Sistema de documentação MDX
- MarkdownRenderer
- Repetição espaçada

### v1.2.0 🔄 (Próxima)

- Estatísticas avançadas
- Perfil completo
- Recuperação de senha

### v1.3.0 📅 (Futuro Próximo)

- Exportação/importação
- Tags e categorias
- Busca avançada

### v2.0.0 🚀 (Futuro)

- PostgreSQL
- Redis cache
- API redesenhada
- Mobile app

---

## 📚 Recursos

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

**Última Atualização**: 05/11/2025
