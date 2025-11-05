# Pull Request

## 📝 Descrição

Descreva as mudanças realizadas de forma clara e concisa.

## 🔗 Issues Relacionadas

Fixes #(issue)
Closes #(issue)
Relates to #(issue)

## 🎯 Tipo de Mudança

- [ ] 🐛 Bug fix (mudança que corrige uma issue)
- [ ] ✨ Nova feature (mudança que adiciona funcionalidade)
- [ ] 💥 Breaking change (fix ou feature que quebra funcionalidade existente)
- [ ] 📝 Documentação (mudanças apenas em documentação)
- [ ] 🎨 Style (formatação, missing semi colons, etc; sem mudança de código)
- [ ] ♻️ Refactoring (refatoração de código sem mudança de funcionalidade)
- [ ] ⚡ Performance (mudança que melhora performance)
- [ ] ✅ Test (adição ou correção de testes)
- [ ] 🔧 Chore (mudanças em build, CI, etc)

## 🧪 Como Foi Testado?

Descreva os testes que você realizou para verificar suas mudanças.

- [ ] Teste A
- [ ] Teste B

**Ambiente de Teste:**

- OS: [ex: Windows 11]
- Navegador: [ex: Chrome 120]
- Node.js: [ex: v18.17.0]

## 📸 Screenshots (se aplicável)

### Antes

[Screenshot ou descrição do comportamento antes]

### Depois

[Screenshot ou descrição do comportamento depois]

## ✅ Checklist

### Código

- [ ] Meu código segue os padrões deste projeto ([CONTRIBUTING.md](../CONTRIBUTING.md))
- [ ] Removi código comentado e console.logs desnecessários
- [ ] Não há warnings ou errors no console
- [ ] Não há warnings ou errors do ESLint
- [ ] O build passa sem erros (`npm run build`)

### Qualidade

- [ ] Fiz uma auto-revisão do meu código
- [ ] Comentei código complexo ou não óbvio
- [ ] Meu código é legível e mantível
- [ ] Segui o princípio DRY (Don't Repeat Yourself)
- [ ] Considerei performance e otimizações

### TypeScript

- [ ] Não usei `any` (ou justifiquei seu uso)
- [ ] Todas as funções têm tipos de retorno
- [ ] Todas as props de componentes estão tipadas
- [ ] Não há erros de tipo do TypeScript

### Testes

- [ ] Adicionei testes que provam que minha correção/feature funciona
- [ ] Testes novos e existentes passam localmente
- [ ] Cobertura de código não diminuiu significativamente

### Documentação

- [ ] Atualizei a documentação relevante
- [ ] Adicionei JSDoc em funções públicas
- [ ] Atualizei README.md (se aplicável)
- [ ] Atualizei CHANGELOG.md (seção [Unreleased])
- [ ] Adicionei exemplos em EXEMPLOS.md (se nova feature)

### Segurança

- [ ] Validei todas as entradas de usuário
- [ ] Sanitizei dados antes de renderizar
- [ ] Não expus informações sensíveis
- [ ] Considerei vulnerabilidades comuns (XSS, SQL injection, etc)

### Acessibilidade

- [ ] Adicionei ARIA labels onde necessário
- [ ] Testei navegação por teclado
- [ ] Verifiquei contraste de cores
- [ ] Componentes são acessíveis

### Git

- [ ] Commits seguem [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] Mensagens de commit são claras e descritivas
- [ ] Branch está atualizada com main/master
- [ ] Não há conflitos de merge

## 📋 Notas para Revisores

Informações adicionais que os revisores devem saber:

- Áreas que precisam atenção especial
- Decisões técnicas importantes
- Trade-offs considerados
- Dependências novas ou atualizadas

## 🚀 Deploy Notes

Se esta PR requer passos especiais para deploy, liste aqui:

- [ ] Requer migração de banco de dados
- [ ] Requer variáveis de ambiente novas/atualizadas
- [ ] Requer mudanças em configuração
- [ ] Requer limpeza de cache
- [ ] Nenhum passo especial necessário

## 📚 Documentação Adicional

Links para:

- Documentação técnica
- Designs ou mockups
- Discussões relacionadas
- Recursos externos

## 🔄 Impacto

### Breaking Changes

Se esta PR contém breaking changes, descreva:

- O que quebra
- Como migrar do código antigo
- Plano de deprecação (se aplicável)

### Performance

- Impacto esperado na performance (positivo/negativo/neutro)
- Métricas ou benchmarks (se aplicável)

### Dependências

- Novas dependências adicionadas: [listar]
- Dependências removidas: [listar]
- Dependências atualizadas: [listar]

---

## 👀 Revisão

**Para os mantenedores:**

- [ ] Código revisado
- [ ] Testes verificados
- [ ] Documentação verificada
- [ ] Segurança verificada
- [ ] Performance verificada
- [ ] Aprovado para merge

---

**Obrigado por contribuir com o MVP Estetoscópio! 🎉**
