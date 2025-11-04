# 📖 Guia Completo de Uso - MVP Estetoscópio

## Sumário

1. [Primeiros Passos](#primeiros-passos)
2. [Gerenciamento de Baralhos](#gerenciamento-de-baralhos)
3. [Tipos de Flashcards](#tipos-de-flashcards)
4. [Modo de Estudo](#modo-de-estudo)
5. [Upload de Arquivos](#upload-de-arquivos)
6. [Atalhos de Teclado](#atalhos-de-teclado)
7. [Dicas e Boas Práticas](#dicas-e-boas-práticas)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Primeiros Passos

### 1. Criando sua Conta

1. Acesse a página inicial do aplicativo
2. Clique em "Criar Conta" ou navegue para `/signup`
3. Preencha os campos:
   - **Nome**: Seu nome completo ou apelido
   - **Email**: Um email válido (será seu login)
   - **Senha**: Mínimo de 6 caracteres (recomendado: use uma senha forte)
4. Clique em "Criar Conta"
5. Você será redirecionado automaticamente para o dashboard

### 2. Fazendo Login

1. Acesse `/login`
2. Digite seu email e senha
3. Clique em "Entrar"
4. Você será levado ao dashboard principal

### 3. Navegando pelo Dashboard

O dashboard mostra:

- **Perfil do Usuário**: Nome, email e tempo de conta
- **Estatísticas**:
  - Total de baralhos criados
  - Total de cards em todos os baralhos
  - Média de cards por baralho
  - Maior baralho
- **Baralhos Recentes**: Últimos 5 baralhos criados ou editados
- **Ações Rápidas**: Botão para criar novo baralho

---

## 📚 Gerenciamento de Baralhos

### Criar um Novo Baralho

1. No dashboard, clique em "Novo Baralho" ou acesse `/baralhos/criar`
2. Digite um título descritivo para o baralho
3. Adicione cards clicando em "Adicionar Card"
4. Configure cada card:
   - Escolha o tipo de conteúdo (Texto, Imagem ou Áudio)
   - Preencha a frente (pergunta)
   - Preencha o verso (resposta)
5. Clique em "Criar Baralho"

**Dica**: Você pode adicionar quantos cards quiser antes de salvar!

### Visualizar Todos os Baralhos

1. Acesse `/baralhos`
2. Você verá uma lista com:
   - Nome do baralho
   - Número de cards
   - Data de criação/atualização
   - Botões de ação (Estudar, Editar, Excluir)

### Editar um Baralho Existente

1. Na lista de baralhos, clique no botão "Editar" (ícone de lápis)
2. Você pode:
   - Alterar o título do baralho
   - Adicionar novos cards
   - Editar cards existentes
   - Remover cards (clique no ícone de lixeira em cada card)
3. Clique em "Salvar Alterações"

**Atenção**: Ao excluir um card, a ação é irreversível após salvar!

### Excluir um Baralho

1. Na lista de baralhos, clique no botão "Excluir" (ícone de lixeira vermelho)
2. Confirme a exclusão no modal que aparece
3. O baralho será permanentemente removido

**Atenção**: Esta ação não pode ser desfeita!

---

## 🎴 Tipos de Flashcards

### 1. Cards de Texto

O tipo mais simples e versátil.

**Características**:

- Suporta texto simples
- Ideal para: definições, fórmulas, vocabulário, conceitos

**Exemplo de uso**:

- **Frente**: "O que é fotossíntese?"
- **Verso**: "Processo pelo qual plantas convertem luz solar em energia química"

### 2. Cards com Imagem

Perfeito para conteúdo visual.

**Características**:

- Suporta imagens JPEG, PNG, GIF
- Pode incluir texto complementar
- Útil para: anatomia, geografia, identificação de objetos

**Formatos aceitos**:

- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- Tamanho máximo: 5MB

**Exemplo de uso**:

- **Frente**: Imagem de um órgão + "Que órgão é este?"
- **Verso**: "Coração"

### 3. Cards com Áudio

Ideal para estudos de idiomas e música.

**Características**:

- Suporta arquivos MP3, WAV, OGG
- Player integrado com controles
- Útil para: pronúncia, música, sons da natureza

**Formatos aceitos**:

- `.mp3`
- `.wav`
- `.ogg`
- Tamanho máximo: 10MB

**Exemplo de uso**:

- **Frente**: Áudio de uma palavra em inglês + "Como se escreve?"
- **Verso**: "Beautiful"

---

## 📖 Modo de Estudo

### Iniciando uma Sessão de Estudo

1. Acesse `/baralhos`
2. Clique no botão "Estudar" (ícone de play) no baralho desejado
3. O primeiro card será exibido

### Interface do Modo de Estudo

**Elementos na Tela**:

- Card atual com a frente visível
- Contador de progresso (ex: "Card 1 de 20")
- Botão "Mostrar Resposta"
- Botões de avaliação (após revelar a resposta)

### Como Estudar

1. **Leia a frente do card** e tente responder mentalmente
2. **Clique em "Mostrar Resposta"** ou pressione `Espaço`
3. **Avalie sua resposta** clicando em um dos botões:
   - 🔴 **Novamente**: Não sabia ou errou completamente
   - 🟡 **Difícil**: Sabia, mas com dificuldade
   - 🟢 **Bom**: Acertou com esforço moderado
   - 🔵 **Fácil**: Acertou facilmente

4. O próximo card aparecerá automaticamente

### Sistema de Repetição Espaçada

O sistema ajusta os intervalos de revisão baseado na sua avaliação:

| Avaliação | Intervalo | Quando Usar |
|-----------|-----------|-------------|
| **Novamente** | Imediato | Você errou ou não sabia |
| **Difícil** | Curto | Sabia, mas hesitou muito |
| **Bom** | Médio | Acertou com esforço normal |
| **Fácil** | Longo | Acertou sem pensar |

**Dica**: Seja honesto na avaliação! O sistema funciona melhor quando você é sincero sobre seu conhecimento.

---

## 📤 Upload de Arquivos

### Como Fazer Upload

**Durante a Criação/Edição de Cards**:

1. Selecione o tipo de conteúdo (Imagem ou Áudio)
2. Clique no botão "Upload"
3. Selecione o arquivo do seu computador
4. Aguarde o upload concluir
5. O arquivo aparecerá na prévia

### Requisitos de Arquivos

#### Imagens

- **Formatos**: JPEG, PNG, GIF
- **Tamanho máximo**: 5MB
- **Recomendações**:
  - Use imagens claras e de boa qualidade
  - Evite imagens muito pesadas
  - Prefira PNG para diagramas e gráficos
  - Use JPEG para fotos

#### Áudios

- **Formatos**: MP3, WAV, OGG
- **Tamanho máximo**: 10MB
- **Recomendações**:
  - MP3 com 128kbps é suficiente para a maioria dos usos
  - Grave em ambiente silencioso
  - Mantenha áudios curtos (< 30 segundos idealmente)

### Gerenciamento de Arquivos

- Arquivos são salvos na pasta `/public/uploads/`
- Cada arquivo recebe um nome único com timestamp
- Arquivos não utilizados NÃO são automaticamente deletados
- Para limpar uploads antigos, delete manualmente da pasta

---

## ⌨️ Atalhos de Teclado

### No Modo de Estudo

| Tecla | Ação |
|-------|------|
| `Espaço` | Virar o card / Mostrar resposta |
| `Enter` | Virar o card / Mostrar resposta |
| `1` | Avaliar como "Novamente" (planejado) |
| `2` | Avaliar como "Difícil" (planejado) |
| `3` | Avaliar como "Bom" (planejado) |
| `4` | Avaliar como "Fácil" (planejado) |

### Na Navegação Geral

| Tecla | Ação |
|-------|------|
| `Ctrl + N` | Novo Baralho (planejado) |
| `Ctrl + B` | Ir para Baralhos (planejado) |
| `Ctrl + H` | Ir para Dashboard (planejado) |

---

## 💡 Dicas e Boas Práticas

### Criando Cards Eficazes

1. **Seja específico**: Uma pergunta, uma resposta
   - ❌ "O que você sabe sobre a célula?"
   - ✅ "Qual a função da mitocôndria?"

2. **Use imagens quando possível**: O cérebro processa imagens 60.000x mais rápido que texto

3. **Mantenha respostas curtas**: Informação direta é mais fácil de memorizar

4. **Use contexto na frente**: Ajuda a lembrar
   - ❌ Frente: "Paris" | Verso: "França"
   - ✅ Frente: "Qual a capital da França?" | Verso: "Paris"

### Organizando Baralhos

1. **Um tema por baralho**: Não misture assuntos muito diferentes
2. **Tamanho ideal**: 15-30 cards por baralho
3. **Nomes descritivos**: Use títulos claros como "Biologia - Célula Animal"
4. **Revisão progressiva**: Crie baralhos por dificuldade (Básico → Intermediário → Avançado)

### Estudando de Forma Eficiente

1. **Estude todos os dias**: 15-20 minutos é melhor que 2 horas uma vez por semana
2. **Seja honesto nas avaliações**: O sistema depende disso para funcionar
3. **Revise erros**: Se marcou "Novamente", revise o conteúdo antes de continuar
4. **Não tenha pressa**: Entendimento > velocidade
5. **Faça pausas**: Use a técnica Pomodoro (25min estudo, 5min pausa)

### Maximizando Retenção

1. **Pratique recall ativo**: Tente lembrar ANTES de virar o card
2. **Use mnemônicos**: Crie associações mentais
3. **Ensine para alguém**: Explicar consolida o conhecimento
4. **Conecte conceitos**: Relacione novos cards com conhecimento anterior
5. **Revise antes de dormir**: A consolidação da memória acontece durante o sono

---

## 🔧 Troubleshooting

### Problemas Comuns

#### "Não consigo fazer login"

**Possíveis causas**:

- Email ou senha incorretos
- Conta não foi criada
- Cookies bloqueados pelo navegador

**Soluções**:

1. Verifique se digitou corretamente
2. Tente criar uma nova conta
3. Habilite cookies no navegador
4. Limpe o cache do navegador

#### "Upload de arquivo falhou"

**Possíveis causas**:

- Arquivo muito grande
- Formato não suportado
- Problemas de conexão

**Soluções**:

1. Verifique o tamanho do arquivo
2. Converta para um formato suportado
3. Tente novamente com conexão estável
4. Use ferramentas online para comprimir o arquivo

#### "Cards não aparecem ao estudar"

**Possíveis causas**:

- Baralho vazio
- Erro ao salvar cards
- Cache do navegador

**Soluções**:

1. Verifique se o baralho tem cards
2. Tente editar e salvar novamente
3. Recarregue a página (F5)
4. Limpe o cache do navegador

#### "Página não carrega / Erro 500"

**Possíveis causas**:

- Problema no servidor
- Banco de dados não inicializou
- Arquivo corrompido

**Soluções**:

1. Recarregue a página
2. Aguarde alguns minutos
3. Verifique se o servidor está rodando
4. Consulte os logs do servidor

#### "Áudio não toca"

**Possíveis causas**:

- Formato incompatível com o navegador
- Arquivo corrompido
- Bloqueio de autoplay

**Soluções**:

1. Converta para MP3
2. Tente fazer upload novamente
3. Clique manualmente no botão play
4. Teste em outro navegador

### Performance

#### "Aplicativo está lento"

**Soluções**:

1. Feche outras abas do navegador
2. Limpe o cache
3. Reduza o tamanho dos arquivos de mídia
4. Use navegadores modernos (Chrome, Firefox, Edge)

#### "Muito consumo de memória"

**Soluções**:

1. Reduza o número de cards com imagens grandes
2. Otimize imagens antes do upload (use ferramentas como TinyPNG)
3. Converta áudios para MP3 com bitrate menor
4. Reinicie o navegador periodicamente

### Dúvidas sobre Funcionalidades

#### "Como exportar meus baralhos?"

⚠️ Funcionalidade planejada para versão futura.

#### "Posso compartilhar baralhos com outros usuários?"

⚠️ Funcionalidade planejada para versão futura.

#### "Tem app mobile?"

⚠️ Por enquanto, use o navegador mobile. App nativo está planejado.

#### "Posso sincronizar entre dispositivos?"

✅ Sim! Seus dados são salvos no servidor. Basta fazer login em qualquer dispositivo.

---

## 📞 Suporte

Para reportar bugs ou sugerir melhorias:

1. Abra uma issue no GitHub (se aplicável)
2. Envie um email para o desenvolvedor
3. Documente o problema com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Screenshots (se possível)
   - Navegador e versão
   - Sistema operacional

---

## 🎯 Recursos Futuros

Planejado para próximas versões:

- [ ] Estatísticas avançadas de estudo
- [ ] Gráficos de progresso
- [ ] Exportação/importação de baralhos
- [ ] Compartilhamento de baralhos
- [ ] Tags e categorias
- [ ] Busca avançada
- [ ] Modo noturno automático
- [ ] App mobile nativo
- [ ] Sincronização offline
- [ ] Gamificação (pontos, conquistas)

---

**Última atualização**: 04 de novembro de 2025

**Versão do documento**: 1.0.0
