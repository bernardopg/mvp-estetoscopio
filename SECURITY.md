# Política de Segurança

## Versões Suportadas

Use esta seção para saber quais versões do MVP Estetoscópio estão recebendo atualizações de segurança.

| Versão | Suportada          |
| ------ | ------------------ |
| 1.1.x  | :white_check_mark: |
| 1.0.x  | :x:                |
| < 1.0  | :x:                |

## Relatando uma Vulnerabilidade

A segurança do MVP Estetoscópio é levada a sério. Agradecemos seus esforços para divulgar suas descobertas de forma responsável.

### Como Reportar

Se você descobrir uma vulnerabilidade de segurança, por favor, siga estas etapas:

1. **NÃO** crie uma issue pública no GitHub
2. Envie um relatório detalhado através de:
   - Criando uma [Security Advisory](https://github.com/bernardopg/mvp-estetoscopio/security/advisories/new) privada no GitHub
   - Ou enviando um e-mail para: bernardo.gomes@bebitterbebetter.com.br

### O Que Incluir no Relatório

Para nos ajudar a entender e resolver o problema rapidamente, inclua:

- Descrição detalhada da vulnerabilidade
- Passos para reproduzir o problema
- Versão(ões) afetada(s)
- Impacto potencial
- Sugestões de correção (se tiver)
- Seu nome/handle para crédito (opcional)

### O Que Esperar

Após enviar um relatório de vulnerabilidade:

1. **Confirmação**: Você receberá uma confirmação dentro de 48 horas
2. **Avaliação**: Avaliaremos a vulnerabilidade e determinaremos sua gravidade
3. **Atualizações**: Manteremos você informado sobre o progresso a cada 5-7 dias
4. **Resolução**: Trabalharemos para resolver a vulnerabilidade o mais rápido possível
5. **Divulgação**: Após a correção, divulgaremos a vulnerabilidade publicamente, creditando você (se desejar)

### Cronograma de Resposta

| Gravidade | Tempo de Resposta Inicial | Tempo de Correção Alvo |
|-----------|---------------------------|------------------------|
| Crítica   | 24 horas                  | 7 dias                 |
| Alta      | 48 horas                  | 30 dias                |
| Média     | 5 dias                    | 90 dias                |
| Baixa     | 7 dias                    | Próxima release        |

## Práticas de Segurança

### Para Usuários

- Sempre use a versão mais recente do MVP Estetoscópio
- Mantenha suas dependências atualizadas
- Use senhas fortes e únicas
- Não compartilhe credenciais de acesso
- Revise as permissões de acesso regularmente

### Para Desenvolvedores

- Siga as diretrizes de código seguro em [CONTRIBUTING.md](CONTRIBUTING.md)
- Execute testes de segurança antes de cada release
- Valide todas as entradas de usuário
- Use prepared statements para queries SQL
- Sanitize dados antes de renderizar em HTML
- Mantenha dependências atualizadas
- Revise código para vulnerabilidades comuns (OWASP Top 10)

## Vulnerabilidades Conhecidas

Atualmente não há vulnerabilidades conhecidas não corrigidas.

Histórico de vulnerabilidades corrigidas pode ser encontrado em:
- [Security Advisories](https://github.com/bernardopg/mvp-estetoscopio/security/advisories)
- [CHANGELOG.md](CHANGELOG.md) (seção Security)

## Recursos de Segurança

### Implementados

- ✅ Autenticação JWT
- ✅ Hash de senhas com bcrypt
- ✅ Cookies HTTP-only
- ✅ Proteção CSRF
- ✅ Validação de entrada
- ✅ Prepared statements SQL
- ✅ Sanitização de saída
- ✅ Rate limiting (planejado)

### OWASP Top 10 Coverage

| Vulnerabilidade | Status | Mitigação |
|-----------------|--------|-----------|
| Injection | ✅ Protegido | Prepared statements, validação de entrada |
| Broken Authentication | ✅ Protegido | JWT, bcrypt, cookies seguros |
| Sensitive Data Exposure | ✅ Protegido | HTTPS, cookies HTTP-only |
| XML External Entities | N/A | Não usa XML |
| Broken Access Control | ✅ Protegido | Middleware de autenticação |
| Security Misconfiguration | ⚠️ Parcial | Em melhoria contínua |
| XSS | ✅ Protegido | Sanitização, React auto-escaping |
| Insecure Deserialization | ✅ Protegido | Validação de JSON |
| Using Components with Known Vulnerabilities | ⚠️ Monitorado | Dependabot ativo |
| Insufficient Logging & Monitoring | 🔄 Em Progresso | Planejado para v1.2.0 |

## Programa de Recompensas

Atualmente não temos um programa formal de recompensas por bugs, mas reconhecemos e creditamos publicamente todos os pesquisadores de segurança que nos ajudam a melhorar a segurança do projeto.

## Contato

Para questões relacionadas a segurança que não sejam vulnerabilidades:
- Abra uma [issue](https://github.com/bernardopg/mvp-estetoscopio/issues) com a tag `security`
- Consulte nossa [documentação](README.md)

---

**Última Atualização**: 05/11/2025
**Política de Segurança - Versão**: 1.0
