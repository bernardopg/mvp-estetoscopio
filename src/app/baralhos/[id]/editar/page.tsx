"use client";

import {
  ArrowLeft,
  FileAudio,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Text,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type CardContent = {
  type: "text" | "image" | "audio";
  content: string;
  text?: string; // Texto opcional para acompanhar imagem/áudio
};

type Card = {
  frente: CardContent;
  verso: CardContent;
};

export default function EditarBaralho() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [titulo, setTitulo] = useState("");
  const [cartas, setCartas] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const fetchDeck = useCallback(async () => {
    try {
      const response = await fetch(`/api/decks/${id}`);
      if (response.ok) {
        const deck = await response.json();
        setTitulo(deck.title);

        // Converter cartas antigas (string) para novo formato (CardContent)
        const parsedCards = JSON.parse(deck.cards) as Array<
          Card | { frente: string; verso: string }
        >;
        const convertedCards = parsedCards.map((card) => {
          // Se já está no novo formato
          if (
            typeof card.frente === "object" &&
            card.frente?.type &&
            typeof card.verso === "object" &&
            card.verso?.type
          ) {
            return card as Card;
          }
          // Converter formato antigo (string) para novo
          return {
            frente: {
              type: "text" as const,
              content:
                typeof card.frente === "string"
                  ? card.frente
                  : card.frente.content || "",
            },
            verso: {
              type: "text" as const,
              content:
                typeof card.verso === "string"
                  ? card.verso
                  : card.verso.content || "",
            },
          };
        });
        setCartas(convertedCards);
      } else {
        alert("Baralho não encontrado");
        router.push("/baralhos");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao carregar baralho");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) fetchDeck();
  }, [id, fetchDeck]);

  const adicionarCarta = () => {
    setCartas([
      ...cartas,
      {
        frente: { type: "text", content: "" },
        verso: { type: "text", content: "" },
      },
    ]);
  };

  const atualizarConteudo = (
    index: number,
    lado: "frente" | "verso",
    content: string
  ) => {
    const novasCartas = [...cartas];
    novasCartas[index][lado].content = content;
    setCartas(novasCartas);
  };

  const atualizarTexto = (
    index: number,
    lado: "frente" | "verso",
    text: string
  ) => {
    const novasCartas = [...cartas];
    novasCartas[index][lado].text = text;
    setCartas(novasCartas);
  };

  const alterarTipo = (
    index: number,
    lado: "frente" | "verso",
    type: "text" | "image" | "audio"
  ) => {
    const novasCartas = [...cartas];
    const currentText = novasCartas[index][lado].text;
    novasCartas[index][lado] = { type, content: "", text: currentText };
    setCartas(novasCartas);
  };

  const removerCarta = (index: number) => {
    setCartas(cartas.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (
    index: number,
    lado: "frente" | "verso",
    file: File
  ) => {
    const key = `${index}-${lado}`;
    setUploading(key);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        atualizarConteudo(index, lado, data.url);
      } else {
        const error = await response.json();
        alert(`Erro no upload: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao fazer upload do arquivo");
    } finally {
      setUploading(null);
    }
  };

  const triggerFileInput = (key: string) => {
    fileInputRefs.current[key]?.click();
  };

  const salvarBaralho = async () => {
    if (!titulo.trim()) {
      alert("Por favor, insira um título para o baralho.");
      return;
    }

    if (cartas.length === 0) {
      alert("Por favor, adicione pelo menos uma carta.");
      return;
    }

    // Validar se todas as cartas têm conteúdo
    const cartasInvalidas = cartas.some(
      (c) => !c.frente.content.trim() || !c.verso.content.trim()
    );

    if (cartasInvalidas) {
      alert("Por favor, preencha o conteúdo de todas as cartas.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/decks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: titulo, cards: cartas }),
      });

      if (response.ok) {
        alert("Baralho atualizado com sucesso!");
        router.push("/baralhos");
      } else {
        const error = await response.json();
        alert(`Erro ao salvar: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  const renderCardSide = (
    carta: Card,
    index: number,
    lado: "frente" | "verso"
  ) => {
    const cardContent = carta[lado];
    const key = `${index}-${lado}`;

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {lado === "frente" ? "Frente" : "Verso"}
        </label>

        {/* Seletor de tipo */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => alterarTipo(index, lado, "text")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              cardContent.type === "text"
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-500"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            <Text className="w-4 h-4" />
            <span className="text-sm font-medium">Texto</span>
          </button>
          <button
            type="button"
            onClick={() => alterarTipo(index, lado, "image")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              cardContent.type === "image"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Imagem</span>
          </button>
          <button
            type="button"
            onClick={() => alterarTipo(index, lado, "audio")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              cardContent.type === "audio"
                ? "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-2 border-pink-500"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            <FileAudio className="w-4 h-4" />
            <span className="text-sm font-medium">Áudio</span>
          </button>
        </div>

        {/* Conteúdo baseado no tipo */}
        {cardContent.type === "text" && (
          <textarea
            value={cardContent.content}
            onChange={(e) => atualizarConteudo(index, lado, e.target.value)}
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 resize-none transition-all"
            rows={4}
            placeholder={
              lado === "frente"
                ? "Digite a pergunta..."
                : "Digite a resposta..."
            }
          />
        )}

        {cardContent.type === "image" && (
          <div className="space-y-3">
            <input
              type="file"
              ref={(el) => {
                fileInputRefs.current[key] = el;
              }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(index, lado, file);
              }}
              accept="image/*"
              className="hidden"
            />

            {!cardContent.content ? (
              <button
                type="button"
                onClick={() => triggerFileInput(key)}
                disabled={uploading === key}
                className="w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex flex-col items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 disabled:opacity-50"
              >
                {uploading === key ? (
                  <>
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Enviando...
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-zinc-400" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Clique para enviar uma imagem
                    </span>
                  </>
                )}
              </button>
            ) : (
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={cardContent.content}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={() => atualizarConteudo(index, lado, "")}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <textarea
              value={cardContent.text || ""}
              onChange={(e) => atualizarTexto(index, lado, e.target.value)}
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 resize-none transition-all"
              rows={3}
              placeholder="Texto opcional para acompanhar a imagem..."
            />
          </div>
        )}

        {cardContent.type === "audio" && (
          <div className="space-y-3">
            <input
              type="file"
              ref={(el) => {
                fileInputRefs.current[key] = el;
              }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(index, lado, file);
              }}
              accept="audio/*"
              className="hidden"
            />

            {!cardContent.content ? (
              <button
                type="button"
                onClick={() => triggerFileInput(key)}
                disabled={uploading === key}
                className="w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg hover:border-pink-500 dark:hover:border-pink-400 transition-colors flex flex-col items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 disabled:opacity-50"
              >
                {uploading === key ? (
                  <>
                    <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Enviando...
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-zinc-400" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Clique para enviar um áudio
                    </span>
                  </>
                )}
              </button>
            ) : (
              <div className="relative p-4 bg-linear-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500 rounded-lg">
                    <FileAudio className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                      Áudio carregado
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {cardContent.content.split("/").pop()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => atualizarConteudo(index, lado, "")}
                    className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <textarea
              value={cardContent.text || ""}
              onChange={(e) => atualizarTexto(index, lado, e.target.value)}
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 resize-none transition-all"
              rows={3}
              placeholder="Texto opcional para acompanhar o áudio..."
            />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-zinc-50 via-purple-50/30 to-pink-50/30 dark:from-black dark:via-purple-950/10 dark:to-pink-950/10 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-zinc-600 dark:text-zinc-400">
                Carregando baralho...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-purple-50/30 to-pink-50/30 dark:from-black dark:via-purple-950/10 dark:to-pink-950/10 py-16 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/baralhos"
            className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos baralhos
          </Link>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl">
              <Save className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Editar Baralho
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Atualize o título e as cartas do seu baralho
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="space-y-6">
          {/* Título */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Título do Baralho
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
              placeholder="Ex: Sons Cardíacos Básicos"
            />
          </div>

          {/* Cartas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Cartas ({cartas.length})
              </h2>
              <button
                type="button"
                onClick={adicionarCarta}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Nova Carta</span>
              </button>
            </div>

            {cartas.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Text className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    Nenhuma carta ainda
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    Clique em &quot;Nova Carta&quot; para adicionar sua primeira
                    carta ao baralho
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cartas.map((carta, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Carta {index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removerCarta(index)}
                        className="flex items-center gap-2 px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Remover</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderCardSide(carta, index, "frente")}
                      {renderCardSide(carta, index, "verso")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão salvar */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/baralhos"
              className="px-6 py-3 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium"
            >
              Cancelar
            </Link>
            <button
              onClick={salvarBaralho}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
