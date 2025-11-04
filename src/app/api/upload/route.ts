import { statements } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não suportado" },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `${timestamp}${ext}`;

    // Criar diretório de uploads se não existir
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Salvar arquivo
    const filepath = path.join(uploadsDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Salvar informações no banco de dados
    const publicPath = `/uploads/${filename}`;
    const result = statements.createMedia.run(
      filename,
      file.name,
      file.type,
      file.size,
      publicPath
    );

    return NextResponse.json({
      id: result.lastInsertRowid,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: publicPath,
    });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
