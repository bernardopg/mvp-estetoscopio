"use client";

import TagSelector from "@/components/TagSelector";
import {
  ArrowLeft,
  Bookmark,
  FileAudio,
  Folder,
  Image as ImageIcon,
  Loader2,
  Palette,
  Plus,
  Save,
  Text,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type CardContent = {
  type: "text" | "image" | "audio";
  content: string;
  text?: string; // Texto opcional para acompanhar imagem/áudio
};

type Card = {
  frente: CardContent;
  verso: CardContent;
};

interface FolderType {
  id: number;
  name: string;
  parent_id: number | null;
  color: string | null;
  icon: string | null;
}

interface TagType {
  id: number;
  name: string;
  color: string | null;
}

const DECK_COLORS = [
  { name: "Padrão", value: null },
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Amarelo", value: "#f59e0b" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Ciano", value: "#06b6d4" },
];

export default function CriarBaralho() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [folderId, setFolderId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [deckColor, setDeckColor] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [cartas, setCartas] = useState<Card[]>([
    {
      frente: { type: "text", content: "" },
      verso: { type: "text", content: "" },
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    fetchFoldersAndTags();
  }, []);

  const fetchFoldersAndTags = async () => {
    try {
      const [foldersRes, tagsRes] = await Promise.all([
        fetch("/api/folders"),
        fetch("/api/tags"),
      ]);

      if (foldersRes.ok) {
        const foldersData = await foldersRes.json();
        setFolders(foldersData);
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setAllTags(tagsData);
      }
    } catch (error) {
      console.error("Erro ao buscar pastas e tags:", error);
    }
  };

  const handleCreateTag = async (name: string, color: string) => {
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setAllTags([...allTags, newTag]);
        return newTag;
      }
      throw new Error("Erro ao criar tag");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

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
    tipo: "text" | "image" | "audio"
  ) => {
    const novasCartas = [...cartas];
    const currentText = novasCartas[index][lado].text || "";
    novasCartas[index][lado] = { type: tipo, content: "", text: currentText };
    setCartas(novasCartas);
  };

  const handleFileUpload = async (
    file: File,
    index: number,
    lado: "frente" | "verso"
  ) => {
    const uploadKey = `${index}-${lado}`;
    setUploading(uploadKey);

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
      alert("Erro ao fazer upload do arquivo.");
    } finally {
      setUploading(null);
    }
  };

  const triggerFileInput = (index: number, lado: "frente" | "verso") => {
    const key = `${index}-${lado}`;
    fileInputRefs.current[key]?.click();
  };

  const removerCarta = (index: number) => {
    setCartas(cartas.filter((_, i) => i !== index));
  };

  const salvarBaralho = async () => {
    if (!titulo.trim()) {
      alert("Por favor, insira um título para o baralho.");
      return;
    }

    if (
      cartas.length === 0 ||
      cartas.some((c) => !c.frente.content.trim() || !c.verso.content.trim())
    ) {
      alert("Por favor, preencha todas as cartas.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: titulo,
          cards: cartas,
          folder_id: folderId,
          tags: selectedTags.map((tag) => tag.id),
          is_bookmarked: isBookmarked,
          color: deckColor,
        }),
      });

      if (response.ok) {
        alert("Baralho criado com sucesso!");
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
    card: CardContent,
    index: number,
    lado: "frente" | "verso"
  ) => {
    const uploadKey = `${index}-${lado}`;
    const isUploading = uploading === uploadKey;

    return (
      <div className="space-y-3">
        {/* Type Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => alterarTipo(index, lado, "text")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              card.type === "text"
                ? "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-2 border-blue-300 dark:border-blue-700"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            <Text className="w-4 h-4" />
            Texto
          </button>
          <button
            onClick={() => alterarTipo(index, lado, "image")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              card.type === "image"
                ? "bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-2 border-purple-300 dark:border-purple-700"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Imagem
          </button>
          <button
            onClick={() => alterarTipo(index, lado, "audio")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              card.type === "audio"
                ? "bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 border-2 border-pink-300 dark:border-pink-700"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            <FileAudio className="w-4 h-4" />
            Áudio
          </button>
        </div>

        {/* Content Input */}
        {card.type === "text" && (
          <textarea
            value={card.content}
            onChange={(e) => atualizarConteudo(index, lado, e.target.value)}
            className="w-full px-4 py-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
            rows={4}
            placeholder="Digite o texto..."
          />
        )}

        {card.type === "image" && (
          <div className="space-y-3">
            <input
              type="file"
              ref={(el) => {
                fileInputRefs.current[uploadKey] = el;
              }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, index, lado);
              }}
              accept="image/*"
              className="hidden"
            />
            {card.content ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700">
                <Image
                  src={card.content}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
                <button
                  onClick={() => atualizarConteudo(index, lado, "")}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => triggerFileInput(index, lado)}
                disabled={isUploading}
                className="w-full p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm">Fazendo upload...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">
                      Clique para fazer upload da imagem
                    </span>
                  </div>
                )}
              </button>
            )}

            {/* Texto opcional para acompanhar a imagem */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                📝 Texto adicional (opcional)
              </label>
              <textarea
                value={card.text || ""}
                onChange={(e) => atualizarTexto(index, lado, e.target.value)}
                className="w-full px-4 py-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                rows={3}
                placeholder="Adicione uma descrição, pergunta ou contexto..."
              />
            </div>
          </div>
        )}

        {card.type === "audio" && (
          <div className="space-y-3">
            <input
              type="file"
              ref={(el) => {
                fileInputRefs.current[uploadKey] = el;
              }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, index, lado);
              }}
              accept="audio/*"
              className="hidden"
            />
            {card.content ? (
              <div className="p-4 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Áudio carregado
                  </span>
                  <button
                    onClick={() => atualizarConteudo(index, lado, "")}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <audio src={card.content} controls className="w-full" />
              </div>
            ) : (
              <button
                onClick={() => triggerFileInput(index, lado)}
                disabled={isUploading}
                className="w-full p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg hover:border-pink-400 dark:hover:border-pink-600 transition-colors"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm">Fazendo upload...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">
                      Clique para fazer upload do áudio
                    </span>
                  </div>
                )}
              </button>
            )}

            {/* Texto opcional para acompanhar o áudio */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                📝 Texto adicional (opcional)
              </label>
              <textarea
                value={card.text || ""}
                onChange={(e) => atualizarTexto(index, lado, e.target.value)}
                className="w-full px-4 py-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                rows={3}
                placeholder="Adicione uma pergunta, contexto ou descrição..."
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-purple-50/20 to-pink-50/20 dark:from-black dark:via-purple-950/10 dark:to-pink-950/10 py-16">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/baralhos"
            className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar aos baralhos</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              Criar Novo Baralho
            </h1>
          </div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Monte seu deck personalizado com texto, imagens ou áudio
          </p>
        </div>

        <div className="space-y-6">
          {/* Título do Baralho */}
          <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
              Título do Baralho
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Ex: Sons Cardíacos Básicos"
            />
          </div>

          {/* Organização */}
          <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Organização
            </h2>
            <div className="space-y-4">
              {/* Pasta */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  <Folder className="w-4 h-4" />
                  Pasta
                </label>
                <select
                  value={folderId || ""}
                  onChange={(e) =>
                    setFolderId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-4 py-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">📂 Sem pasta (raiz)</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.icon || "📁"} {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  🏷️ Tags
                </label>
                <TagSelector
                  availableTags={allTags}
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  onCreateTag={handleCreateTag}
                />
              </div>

              {/* Favorito e Cor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Favorito */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    <Bookmark className="w-4 h-4" />
                    Favorito
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                      isBookmarked
                        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-amber-400 dark:hover:border-amber-600"
                    }`}
                  >
                    <Bookmark
                      className={`w-5 h-5 ${
                        isBookmarked ? "fill-current" : ""
                      }`}
                    />
                    <span className="font-medium">
                      {isBookmarked ? "Favoritado" : "Marcar como favorito"}
                    </span>
                  </button>
                </div>

                {/* Cor */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    <Palette className="w-4 h-4" />
                    Cor do Baralho
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {DECK_COLORS.map((colorOption) => (
                      <button
                        key={colorOption.value || "default"}
                        type="button"
                        onClick={() => setDeckColor(colorOption.value)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                          deckColor === colorOption.value
                            ? "border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/30"
                            : "border-zinc-300 dark:border-zinc-600 hover:border-purple-400 dark:hover:border-purple-500"
                        }`}
                        style={{
                          backgroundColor: colorOption.value || "#ffffff",
                        }}
                        title={colorOption.name}
                      >
                        {deckColor === colorOption.value && (
                          <span className="text-white text-xl font-bold drop-shadow-lg">
                            ✓
                          </span>
                        )}
                        {!colorOption.value && (
                          <span className="text-zinc-400 dark:text-zinc-600 text-xs">
                            Padrão
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Section */}
          <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Cartas ({cartas.length})
              </h2>
              <button
                onClick={adicionarCarta}
                className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                Adicionar Carta
              </button>
            </div>

            <div className="space-y-6">
              {cartas.map((carta, index) => (
                <div
                  key={index}
                  className="group p-6 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-linear-to-r from-purple-500 to-pink-600 text-xs font-semibold text-white">
                      Carta {index + 1}
                    </span>
                    <button
                      onClick={() => removerCarta(index)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:text-white rounded-lg text-sm font-medium transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remover
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                        💭 Frente (Pergunta)
                      </label>
                      {renderCardSide(carta.frente, index, "frente")}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                        ✨ Verso (Resposta)
                      </label>
                      {renderCardSide(carta.verso, index, "verso")}
                    </div>
                  </div>
                </div>
              ))}

              {cartas.length === 0 && (
                <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                  <p>
                    Nenhuma carta ainda. Clique em &quot;Adicionar Carta&quot;
                    para começar.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Link
              href="/baralhos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Link>
            <button
              onClick={salvarBaralho}
              disabled={saving || uploading !== null}
              className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Baralho
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
