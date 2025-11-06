"use client";

import { ArrowLeft, CheckCircle2, FileJson, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ImportPreview {
  title: string;
  cardsCount: number;
  tagsCount: number;
  hasProgress: boolean;
  color?: string;
  icon?: string;
}

export default function ImportarBaralho() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [jsonData, setJsonData] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setFile(selectedFile);

    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text);

      // Validar estrutura básica
      if (!data.deck || !data.cards || !Array.isArray(data.cards)) {
        throw new Error(
          "Arquivo inválido. Certifique-se de que é um arquivo exportado do sistema."
        );
      }

      setJsonData(data);
      setPreview({
        title: data.deck.title || "Sem título",
        cardsCount: data.cards.length,
        tagsCount: data.tags?.length || 0,
        hasProgress: !!data.progress,
        color: data.deck.color,
        icon: data.deck.icon,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao ler arquivo. Verifique se é um JSON válido."
      );
      setFile(null);
      setPreview(null);
      setJsonData(null);
    }
  };

  const handleImport = async () => {
    if (!jsonData) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/decks/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao importar baralho");
      }

      await res.json(); // Descartar resultado
      setSuccess(true);

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push(`/baralhos`);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao importar baralho. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setJsonData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-3">
            <Upload className="w-10 h-10" />
            Importar Baralho
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Importe um baralho exportado em formato JSON
          </p>
        </div>

        {success ? (
          // Mensagem de sucesso
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-12 text-center border border-green-200 dark:border-green-900">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Baralho importado com sucesso!
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Redirecionando para seus baralhos...
            </p>
          </div>
        ) : (
          <>
            {/* Upload Area */}
            {!file ? (
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                <label className="flex flex-col items-center justify-center gap-4 cursor-pointer">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <FileJson className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                      Clique para selecionar um arquivo JSON
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      ou arraste e solte aqui
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <>
                {/* Preview */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden mb-6">
                  {/* Header do Preview */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileJson className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {file.name}
                      </span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      onClick={clearFile}
                      className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Conteúdo do Preview */}
                  {preview && (
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-6">
                        {preview.icon && (
                          <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                            style={{
                              backgroundColor: preview.color || "#3b82f6",
                            }}
                          >
                            {preview.icon}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                            {preview.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                            <span className="flex items-center gap-1">
                              📇 {preview.cardsCount} cards
                            </span>
                            {preview.tagsCount > 0 && (
                              <span className="flex items-center gap-1">
                                🏷️ {preview.tagsCount} tags
                              </span>
                            )}
                            {preview.hasProgress && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                                Com progresso
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleImport}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Importando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5" />
                              Confirmar Importação
                            </>
                          )}
                        </button>
                        <button
                          onClick={clearFile}
                          disabled={loading}
                          className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                    Erro ao importar
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Instruções */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6 mt-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <FileJson className="w-5 h-5" />
                Como importar um baralho
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>
                    Selecione um arquivo JSON exportado do sistema usando o
                    botão acima
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>
                    Revise as informações do baralho no preview (título, número
                    de cards, tags)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>
                    Clique em &ldquo;Confirmar Importação&rdquo; para adicionar
                    o baralho à sua biblioteca
                  </span>
                </li>
              </ul>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-4">
                💡 <strong>Dica:</strong> Apenas arquivos JSON exportados deste
                sistema são suportados.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
