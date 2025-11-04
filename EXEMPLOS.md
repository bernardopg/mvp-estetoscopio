# 📝 Exemplos de Uso - Componentes

Este documento contém exemplos práticos de como usar os componentes do MVP Estetoscópio.

## Sumário

- [Flashcard Básico](#flashcard-básico)
- [MediaFlashcard](#mediaflashcard)
- [AudioPlayer](#audioplayer)
- [Casos de Uso Reais](#casos-de-uso-reais)

---

## 🎴 Flashcard Básico

O componente `Flashcard` é ideal para cards simples com texto.

### Uso Básico

```tsx
import Flashcard from "@/components/Flashcard";

export default function Example() {
  return (
    <Flashcard
      front={<>Qual é a capital do Brasil?</>}
      back={<>Brasília</>}
    />
  );
}
```

### Com Props Personalizadas

```tsx
import Flashcard from "@/components/Flashcard";
import { useState } from "react";

export default function CustomFlashcard() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Flashcard
      front={<>2 + 2 = ?</>}
      back={<>4</>}
      initialFlipped={false}
      showControls={true}
      onFlipChange={(flipped) => {
        setIsFlipped(flipped);
        console.log(`Card está ${flipped ? 'virado' : 'normal'}`);
      }}
      labels={{
        showAnswer: "Ver Resposta",
        hideAnswer: "Ocultar Resposta",
        again: "Errei",
        hard: "Difícil",
        good: "Acertei",
        easy: "Fácil Demais"
      }}
    />
  );
}
```

### Sem Controles de Avaliação

```tsx
<Flashcard
  front={<>Pergunta</>}
  back={<>Resposta</>}
  showControls={false}
/>
```

### Com Estilização Customizada

```tsx
<Flashcard
  front={<>Pergunta</>}
  back={<>Resposta</>}
  className="max-w-md"
/>
```

---

## 🎨 MediaFlashcard

O componente `MediaFlashcard` suporta texto, imagens e áudio.

### Card com Texto Simples

```tsx
import { MediaFlashcard } from "@/components/MediaFlashcard";

export default function TextCard() {
  return (
    <MediaFlashcard
      front={{
        type: "text",
        content: "Qual é a fórmula da água?"
      }}
      back={{
        type: "text",
        content: "H₂O"
      }}
    />
  );
}
```

### Card com Imagem

```tsx
<MediaFlashcard
  front={{
    type: "image",
    content: "/uploads/celula.jpg",
    text: "Que estrutura celular é esta?"
  }}
  back={{
    type: "text",
    content: "Mitocôndria - a usina de energia da célula"
  }}
/>
```

### Card com Áudio

```tsx
<MediaFlashcard
  front={{
    type: "audio",
    content: "/uploads/pronunciation.mp3",
    text: "Como se pronuncia esta palavra?"
  }}
  back={{
    type: "text",
    content: "Beautiful [ˈbjuːtɪfʊl]"
  }}
/>
```

### Card Complexo: Imagem → Imagem

```tsx
<MediaFlashcard
  front={{
    type: "image",
    content: "/uploads/anatomia-coracao.jpg",
    text: "Identifique esta estrutura"
  }}
  back={{
    type: "image",
    content: "/uploads/anatomia-coracao-legendado.jpg",
    text: "Átrio Direito"
  }}
/>
```

### Card com HTML na Resposta

```tsx
<MediaFlashcard
  front={{
    type: "text",
    content: "O que é ATP?"
  }}
  back={{
    type: "text",
    content: `
      <strong>Adenosina Trifosfato</strong>
      <br><br>
      Molécula que armazena energia nas células.
      <br><br>
      Fórmula: C₁₀H₁₆N₅O₁₃P₃
    `
  }}
/>
```

---

## 🔊 AudioPlayer

Componente de player de áudio simples e elegante.

### Uso Básico

```tsx
import AudioPlayer from "@/components/AudioPlayer";

export default function AudioExample() {
  return <AudioPlayer src="/uploads/audio.mp3" />;
}
```

### Em um Card Personalizado

```tsx
export default function CustomAudioCard() {
  return (
    <div className="p-6 rounded-lg bg-white shadow-lg">
      <h3 className="text-lg font-bold mb-4">
        Ouça a pronúncia correta:
      </h3>
      <AudioPlayer src="/uploads/word-pronunciation.mp3" />
      <p className="mt-4 text-sm text-gray-600">
        Repita 3 vezes em voz alta
      </p>
    </div>
  );
}
```

---

## 🎯 Casos de Uso Reais

### 1. Vocabulário de Idiomas

```tsx
// Palavra em inglês com áudio de pronúncia
<MediaFlashcard
  front={{
    type: "audio",
    content: "/uploads/apple-pronunciation.mp3",
    text: "Como se escreve esta palavra?"
  }}
  back={{
    type: "text",
    content: `
      <strong>Apple</strong>
      <br>
      Tradução: Maçã
      <br>
      Pronúncia: [ˈæpəl]
    `
  }}
/>
```

### 2. Anatomia Médica

```tsx
// Identificação de estruturas anatômicas
<MediaFlashcard
  front={{
    type: "image",
    content: "/uploads/cerebro-humano.jpg",
    text: "Qual é esta região do cérebro?"
  }}
  back={{
    type: "text",
    content: `
      <strong>Córtex Pré-Frontal</strong>
      <br><br>
      Função: Tomada de decisões, planejamento e personalidade
      <br><br>
      Localização: Parte anterior do lobo frontal
    `
  }}
/>
```

### 3. Identificação de Sons

```tsx
// Reconhecimento auditivo
<MediaFlashcard
  front={{
    type: "audio",
    content: "/uploads/birds/canario.mp3",
    text: "Que pássaro faz este som?"
  }}
  back={{
    type: "image",
    content: "/uploads/birds/canario.jpg",
    text: "Canário (Serinus canaria)"
  }}
/>
```

### 4. Fórmulas Matemáticas

```tsx
<MediaFlashcard
  front={{
    type: "text",
    content: "Teorema de Pitágoras"
  }}
  back={{
    type: "text",
    content: `
      <div style="font-size: 24px; text-align: center;">
        a² + b² = c²
      </div>
      <br>
      Onde:
      <br>
      • a e b = catetos
      <br>
      • c = hipotenusa
    `
  }}
/>
```

### 5. Geografia

```tsx
<MediaFlashcard
  front={{
    type: "image",
    content: "/uploads/maps/brazil-outline.png",
    text: "Qual país é este?"
  }}
  back={{
    type: "text",
    content: `
      <strong>Brasil</strong>
      <br><br>
      Capital: Brasília
      <br>
      População: ~215 milhões
      <br>
      Área: 8.515.767 km²
    `
  }}
/>
```

### 6. Química Orgânica

```tsx
<MediaFlashcard
  front={{
    type: "image",
    content: "/uploads/chemistry/glucose-structure.png",
    text: "Que molécula é esta?"
  }}
  back={{
    type: "text",
    content: `
      <strong>Glicose (C₆H₁₂O₆)</strong>
      <br><br>
      Tipo: Monossacarídeo
      <br>
      Função: Principal fonte de energia celular
      <br>
      Encontrado em: Frutas, mel, sangue
    `
  }}
/>
```

### 7. História com Imagens

```tsx
<MediaFlashcard
  front={{
    type: "image",
    content: "/uploads/history/declaration.jpg",
    text: "Que documento histórico é este?"
  }}
  back={{
    type: "text",
    content: `
      <strong>Declaração de Independência dos EUA</strong>
      <br><br>
      Data: 4 de julho de 1776
      <br>
      Autor principal: Thomas Jefferson
      <br>
      Significado: Marcou a independência das 13 colônias
    `
  }}
/>
```

### 8. Música - Teoria Musical

```tsx
<MediaFlashcard
  front={{
    type: "audio",
    content: "/uploads/music/cmajor-chord.mp3",
    text: "Que acorde é este?"
  }}
  back={{
    type: "text",
    content: `
      <strong>Dó Maior (C Major)</strong>
      <br><br>
      Notas: C - E - G
      <br>
      Tipo: Acorde maior (tríade)
      <br>
      Tom: Alegre e brilhante
    `
  }}
/>
```

---

## 🔄 Combinações Avançadas

### Lista de Cards para Estudo

```tsx
export default function StudySession() {
  const cards = [
    {
      front: { type: "text", content: "Pergunta 1" },
      back: { type: "text", content: "Resposta 1" }
    },
    {
      front: { type: "image", content: "/img1.jpg", text: "Pergunta 2" },
      back: { type: "text", content: "Resposta 2" }
    },
    {
      front: { type: "audio", content: "/audio1.mp3", text: "Pergunta 3" },
      back: { type: "text", content: "Resposta 3" }
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div>
      <p>Card {currentIndex + 1} de {cards.length}</p>
      <MediaFlashcard
        {...cards[currentIndex]}
        onFlipChange={() => console.log("Virou!")}
      />
      <button onClick={() => setCurrentIndex(i => (i + 1) % cards.length)}>
        Próximo Card
      </button>
    </div>
  );
}
```

### Card com Feedback Visual

```tsx
export default function FeedbackCard() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={flipped ? "border-green-500" : "border-blue-500"}>
      <Flashcard
        front={<>Pergunta</>}
        back={<>Resposta</>}
        onFlipChange={setFlipped}
      />
    </div>
  );
}
```

---

## 📚 Exemplos de Baralhos Completos

### Baralho de Biologia

```json
{
  "title": "Biologia - Célula Animal",
  "cards": [
    {
      "front": { "type": "text", "content": "Qual organela é responsável pela respiração celular?" },
      "back": { "type": "text", "content": "Mitocôndria" }
    },
    {
      "front": { "type": "image", "content": "/uploads/nucleus.jpg", "text": "Que estrutura celular é esta?" },
      "back": { "type": "text", "content": "Núcleo - contém o DNA da célula" }
    },
    {
      "front": { "type": "text", "content": "O que é fotossíntese?" },
      "back": { "type": "text", "content": "Processo pelo qual plantas convertem luz solar em energia química (glicose)" }
    }
  ]
}
```

### Baralho de Inglês

```json
{
  "title": "Inglês - Vocabulário Básico",
  "cards": [
    {
      "front": { "type": "audio", "content": "/uploads/hello.mp3", "text": "Como se escreve?" },
      "back": { "type": "text", "content": "Hello - Olá" }
    },
    {
      "front": { "type": "text", "content": "Como se diz 'Obrigado' em inglês?" },
      "back": { "type": "audio", "content": "/uploads/thankyou.mp3", "text": "Thank you" }
    },
    {
      "front": { "type": "image", "content": "/uploads/apple.jpg", "text": "Como se chama esta fruta em inglês?" },
      "back": { "type": "text", "content": "Apple - Maçã" }
    }
  ]
}
```

---

## 💡 Dicas de Implementação

### Performance

```tsx
// Use React.memo para cards que não mudam frequentemente
import { memo } from "react";

const MemoizedFlashcard = memo(Flashcard);

// Use no seu componente
<MemoizedFlashcard front={<>Q</>} back={<>A</>} />
```

### Acessibilidade

```tsx
// Sempre forneça textos alternativos para imagens
<MediaFlashcard
  front={{
    type: "image",
    content: "/img.jpg",
    text: "Descrição clara da imagem para leitores de tela"
  }}
  back={{
    type: "text",
    content: "Resposta"
  }}
/>
```

### Lazy Loading

```tsx
// Para muitos cards, use lazy loading
import dynamic from "next/dynamic";

const DynamicFlashcard = dynamic(() => import("@/components/Flashcard"), {
  loading: () => <p>Carregando...</p>
});
```

---

**Última atualização**: 04 de novembro de 2025
