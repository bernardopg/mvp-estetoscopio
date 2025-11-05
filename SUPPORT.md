# 💬 Suporte

Precisa de ajuda com o MVP Estetoscópio? Este documento vai guiá-lo nas melhores formas de obter suporte.

---

## 📚 Documentação

Antes de procurar ajuda, confira nossa documentação completa:

### Guias Principais

| Documento | Quando Usar |
|-----------|-------------|
| **[README.md](README.md)** | Visão geral, instalação e configuração inicial |
| **[GUIA_DE_USO.md](GUIA_DE_USO.md)** | Manual completo para usuários finais |
| **[EXEMPLOS.md](EXEMPLOS.md)** | Exemplos práticos de código e uso |
| **[ARQUITETURA.md](ARQUITETURA.md)** | Documentação técnica e arquitetura |
| **[FAQ.md](FAQ.md)** | Perguntas frequentes e soluções |

### Documentação MDX

Acesse a documentação interativa em `/docs`:
- **Guia do Usuário**: `/docs/guia`
- **Documentação da API**: `/docs/api`
- **Exemplos Práticos**: `/docs/exemplos`
- **Perguntas Frequentes**: `/docs/faq`

---

## 🆘 Como Obter Ajuda

### 1. Pesquise Primeiro

Antes de criar uma nova issue:

- ✅ Leia o [FAQ.md](FAQ.md)
- ✅ Pesquise nas [issues existentes](https://github.com/bernardopg/mvp-estetoscopio/issues)
- ✅ Verifique as [discussões](https://github.com/bernardopg/mvp-estetoscopio/discussions)
- ✅ Consulte a [documentação](#documentação)

### 2. Issues do GitHub

Para reportar bugs ou problemas técnicos:

👉 [Criar Nova Issue](https://github.com/bernardopg/mvp-estetoscopio/issues/new/choose)

**Escolha o template apropriado:**
- 🐛 **Bug Report** - Para reportar bugs
- ✨ **Feature Request** - Para sugerir melhorias
- 📚 **Documentation** - Para melhorias na documentação
- ❓ **Question** - Para perguntas gerais

### 3. GitHub Discussions

Para discussões gerais, dúvidas ou compartilhar ideias:

👉 [Iniciar Discussão](https://github.com/bernardopg/mvp-estetoscopio/discussions)

**Categorias disponíveis:**
- 💡 **Ideas** - Compartilhe ideias e sugestões
- 🙏 **Q&A** - Faça perguntas e obtenha respostas
- 📣 **Announcements** - Acompanhe novidades
- 🎉 **Show and Tell** - Compartilhe seus projetos
- 🗳️ **Polls** - Participe de enquetes

---

## 🐛 Reportando Bugs

### Informações Necessárias

Ao reportar um bug, inclua:

#### Descrição
- Título claro e descritivo
- O que aconteceu vs o que deveria acontecer
- Gravidade do problema (crítico, alto, médio, baixo)

#### Reprodução
```markdown
## Passos para Reproduzir

1. Vá para '...'
2. Clique em '...'
3. Digite '...'
4. Veja o erro
```

#### Ambiente
```markdown
## Ambiente

- **OS**: [ex: Windows 11, macOS 14, Ubuntu 22.04]
- **Navegador**: [ex: Chrome 120, Firefox 121, Safari 17]
- **Versão do Projeto**: [ex: v1.1.0]
- **Node.js**: [ex: v18.17.0]
```

#### Screenshots/Logs
- Capturas de tela do problema
- Logs do console (F12 > Console)
- Mensagens de erro completas

#### Código (se aplicável)
```typescript
// Código que causa o problema
```

---

## ✨ Sugerindo Melhorias

### Template de Feature Request

```markdown
## Problema

[Descreva o problema que a feature resolveria]

## Solução Proposta

[Descreva como a feature funcionaria]

## Alternativas Consideradas

[Descreva alternativas que você considerou]

## Informações Adicionais

[Screenshots, mockups, exemplos de outras aplicações]
```

---

## 📖 Melhorando a Documentação

Documentação confusa ou incompleta? Você pode:

1. **Abrir uma issue**: Use o template "Documentation"
2. **Contribuir diretamente**: Veja [CONTRIBUTING.md](CONTRIBUTING.md)
3. **Sugerir exemplos**: Compartilhe casos de uso

---

## ⏱️ Tempo de Resposta

| Tipo | Tempo Esperado |
|------|----------------|
| Bug crítico (produção quebrada) | 24-48 horas |
| Bug de alta prioridade | 2-5 dias |
| Feature requests | 1-2 semanas |
| Perguntas gerais | 3-7 dias |
| Melhorias de documentação | 1-2 semanas |

**Nota**: Tempos são estimativas. O projeto é mantido por voluntários.

---

## 🔒 Questões de Segurança

**NÃO** reporte vulnerabilidades de segurança publicamente!

Para questões de segurança, consulte [SECURITY.md](SECURITY.md):
- Crie um [Security Advisory](https://github.com/bernardopg/mvp-estetoscopio/security/advisories/new)
- Ou envie e-mail para: bernardo.gomes@bebitterbebetter.com.br

---

## 💼 Suporte Profissional

Precisa de suporte dedicado ou customizações?

- **Consultoria**: Entre em contato para discutir suas necessidades
- **Desenvolvimento customizado**: Solicite um orçamento
- **Treinamento**: Workshops e sessões de treinamento disponíveis

📧 Contato: bernardo.gomes@bebitterbebetter.com.br

---

## 🌍 Comunidade

### Contribua com o Projeto

- 🐛 Reporte bugs
- ✨ Sugira features
- 📝 Melhore documentação
- 💻 Contribua com código
- 🌟 Dê uma estrela no GitHub

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para mais detalhes.

### Redes Sociais

- **GitHub**: [@bernardopg](https://github.com/bernardopg)
- **Twitter**: [@be.pgomes](https://instagram.com/be.pgomes)
- **LinkedIn**: 

---

## 📋 Checklist de Troubleshooting

Antes de pedir ajuda, tente:

### Problemas de Instalação

- [ ] Node.js versão 18+ instalado?
- [ ] `npm install` executado com sucesso?
- [ ] Porta 3000 disponível?
- [ ] Variáveis de ambiente configuradas?

### Problemas de Build

- [ ] Dependências atualizadas? (`npm update`)
- [ ] Cache limpo? (`rm -rf .next`)
- [ ] Build sem erros? (`npm run build`)

### Problemas de Autenticação

- [ ] JWT_SECRET configurado?
- [ ] Cookies habilitados no navegador?
- [ ] Tentou fazer logout e login novamente?
- [ ] Limpar cache do navegador?

### Problemas de Upload

- [ ] Arquivo dentro do tamanho permitido?
- [ ] Formato de arquivo suportado?
- [ ] Permissões da pasta `/public/uploads`?

### Problemas de Banco de Dados

- [ ] Arquivo `database.db` existe?
- [ ] Permissões de leitura/escrita?
- [ ] Tabelas criadas corretamente?

---

## 📚 Recursos Adicionais

### Aprendendo as Tecnologias

- **Next.js**: [Documentação Oficial](https://nextjs.org/docs)
- **React**: [Docs Interativos](https://react.dev)
- **TypeScript**: [Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- **Tailwind CSS**: [Documentação](https://tailwindcss.com/docs)

### Cursos e Tutoriais

- [Next.js Learn](https://nextjs.org/learn) - Curso oficial gratuito
- [React Tutorial](https://react.dev/learn) - Guia interativo
- [TypeScript for Beginners](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)

---

## 🙏 Agradecimentos

Obrigado por usar o MVP Estetoscópio! Sua pergunta ou feedback nos ajuda a melhorar.

---

## 📞 Contatos

### Para Issues Técnicas
- GitHub Issues: https://github.com/bernardopg/mvp-estetoscopio/issues

### Para Discussões
- GitHub Discussions: https://github.com/bernardopg/mvp-estetoscopio/discussions

### Para Segurança
- Security Advisories: https://github.com/bernardopg/mvp-estetoscopio/security/advisories
- Email: bernardo.gomes@bebitterbebetter.com.br

### Para Negócios
- Email: bernardo.gomes@bebitterbebetter.com.br
- LinkedIn: [Seu Perfil](https://linkedin.com/in/seu-perfil)

---

**Última Atualização**: 05/11/2025
**Versão**: 1.0

---

> 💡 **Dica**: Adicione este repositório aos favoritos e ative as notificações para ficar por dentro das novidades!
