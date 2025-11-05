---
title: Getting Started
description: Primeiros passos com o MVP Estetoscópio
category: user
tags: [inicio, tutorial, instalacao]
lastUpdated: 2025-11-05
---

# 🚀 Getting Started

Bem-vindo ao MVP Estetoscópio! Este guia vai ajudá-lo a começar a usar o sistema de flashcards com repetição espaçada.

---

## ⚡ Início Rápido

### Acessando o Sistema

1. Abra seu navegador
2. Acesse: `http://localhost:3000` (desenvolvimento) ou seu domínio de produção
3. Você será redirecionado para a tela de login

### Primeira Vez?

Se é sua primeira vez, você precisará criar uma conta:

1. Na tela de login, clique em **"Criar conta"**
2. Preencha o formulário de registro:
   - **Nome**: Seu nome completo
   - **Email**: Um email válido
   - **Senha**: Mínimo 6 caracteres
3. Clique em **"Registrar"**
4. Você será automaticamente logado

---

## 📚 Criando Seu Primeiro Baralho

Após fazer login, você verá o dashboard. Vamos criar seu primeiro baralho!

### Passo 1: Acessar Criação

- Clique no botão **"+ Novo Baralho"** no dashboard
- Ou navegue para `/baralhos/criar`

### Passo 2: Adicionar Informações

1. **Título do Baralho**: Ex: "Inglês - Vocabulário"
2. **Adicionar Cards**: Clique em "+ Adicionar Card"

### Passo 3: Criar Cards

Para cada card, você pode escolher o tipo de conteúdo:

#### Tipo: Texto

- **Frente**: Pergunta ou termo
- **Verso**: Resposta ou definição

**Exemplo:**
```
Frente: What is the capital of France?
Verso: Paris
```

#### Tipo: Imagem

- **Frente**: Faça upload de uma imagem
- **Texto adicional** (opcional): Legenda ou pergunta
- **Verso**: Resposta (texto)

**Exemplo:**
```
Frente: [imagem de uma bandeira]
Verso: França
```

#### Tipo: Áudio

- **Frente**: Faça upload de um áudio
- **Texto adicional** (opcional): Contexto
- **Verso**: Resposta ou tradução

**Exemplo:**
```
Frente: [áudio de uma palavra em inglês] + "Traduza"
Verso: Olá
```

### Passo 4: Salvar

- Clique em **"Criar Baralho"**
- Você será redirecionado para a lista de baralhos

---

##  🎯 Estudando com Flashcards

### Iniciando o Estudo

1. No dashboard, clique em um baralho
2. Clique em **"Estudar"**
3. O sistema mostrará o primeiro card

### Como Funciona

1. **Veja a Frente**: Leia a pergunta ou veja o conteúdo
2. **Pense na Resposta**: Tente lembrar antes de virar
3. **Vire o Card**:
   - Pressione **Espaço** ou **Enter**
   - Ou clique no botão "Virar Card"
4. **Avalie sua Resposta**:
   - **Novamente** 🔴 - Errei completamente
   - **Difícil** 🟡 - Acertei mas com dificuldade
   - **Bom** 🟢 - Acertei normalmente
   - **Fácil** 🔵 - Acertei facilmente

### Sistema de Repetição Espaçada

O sistema ajusta automaticamente quando você verá o card novamente:

- **Novamente**: Verá em breve
- **Difícil**: Intervalo curto
- **Bom**: Intervalo médio
- **Fácil**: Intervalo longo

Quanto melhor sua avaliação, mais tempo até revisar!

---

## ⚙️ Gerenciando Baralhos

### Ver Todos os Baralhos

- No dashboard, veja a lista de seus baralhos
- Ou navegue para `/baralhos`

### Editar um Baralho

1. Clique no ícone de **editar** (✏️) do baralho
2. Modifique título ou cards
3. Salve as mudanças

### Excluir um Baralho

1. Clique no ícone de **excluir** (🗑️) do baralho
2. Confirme a exclusão

**⚠️ Atenção**: Esta ação não pode ser desfeita!

---

## 📊 Acompanhando Seu Progresso

### Dashboard

O dashboard mostra:

- **Total de Baralhos**: Quantos baralhos você tem
- **Total de Cards**: Quantos cards no total
- **Média de Cards**: Média por baralho
- **Maior Baralho**: Seu baralho mais extenso

### Estatísticas do Baralho

Cada baralho mostra:

- Número de cards
- Cards revisados
- Última revisão

---

## 🔐 Gerenciando Sua Conta

### Ver Perfil

- Clique no seu nome no menu
- Selecione "Perfil"

### Fazer Logout

- Clique em "Sair" no menu
- Você será redirecionado para o login

---

## 💡 Dicas para Melhores Resultados

### Criação de Cards

1. **Seja específico**: Perguntas claras = melhores respostas
2. **Uma ideia por card**: Não sobrecarregue
3. **Use contexto**: Adicione exemplos quando relevante
4. **Varie os tipos**: Misture texto, imagem e áudio

### Estudo

1. **Seja honesto**: Avalie corretamente sua resposta
2. **Estude regularmente**: Consistência é chave
3. **Não pule cards**: O algoritmo funciona melhor com feedback
4. **Revise primeiro a frente**: Tente lembrar antes de virar

### Organização

1. **Baralhos temáticos**: Separe por assunto
2. **Tamanho ideal**: 20-50 cards por baralho
3. **Nomes descritivos**: Facilita localização
4. **Atualize regularmente**: Adicione novos cards

---

## 🆘 Problemas Comuns

### Não consigo fazer login

- Verifique email e senha
- Tente resetar a senha (se disponível)
- Limpe o cache do navegador

### Upload não funciona

- Verifique o formato do arquivo:
  - **Imagens**: JPG, PNG, GIF
  - **Áudio**: MP3, WAV, OGG
- Verifique o tamanho (máximo 5MB)
- Tente outro navegador

### Cards não aparecem

- Recarregue a página (F5)
- Verifique sua conexão
- Faça logout e login novamente

### Mais Problemas?

Consulte o [FAQ](./faq.md) ou entre em contato:

- **Email**: bernardo.gomes@bebitterbebetter.com.br
- **Issues**: [GitHub Issues](https://github.com/bernardopg/mvp-estetoscopio/issues)

---

## 📚 Próximos Passos

Agora que você sabe o básico:

1. **[User Guide](./user-guide.md)** - Guia completo de funcionalidades
2. **[Examples](./examples.md)** - Exemplos práticos de uso
3. **[FAQ](./faq.md)** - Perguntas frequentes

---

## 🎉 Comece Agora!

Pronto para criar seus próprios flashcards?

[Criar Primeiro Baralho](/baralhos/criar){.button}

---

**Bons estudos!** 📖✨
