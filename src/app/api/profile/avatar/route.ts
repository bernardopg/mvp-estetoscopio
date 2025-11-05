import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import crypto from "crypto";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use JPEG, PNG ou WebP" },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const extension = file.name.split(".").pop();
    const filename = `avatar-${user.id}-${crypto
      .randomBytes(8)
      .toString("hex")}.${extension}`;

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    const filePath = path.join(uploadDir, filename);

    // Criar diretório se não existir
    const fs = await import("fs");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await writeFile(filePath, buffer);

    // Atualizar banco de dados com o caminho do avatar
    const avatarUrl = `/uploads/avatars/${filename}`;

    // Buscar usuário atual para pegar os dados
    const dbUser = statements.getUser.get(user.id) as
      | {
          id: number;
          name: string;
          email: string;
          profile_picture: string | null;
        }
      | undefined;

    if (!dbUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Deletar avatar antigo se existir
    if (dbUser.profile_picture) {
      const oldFilePath = path.join(
        process.cwd(),
        "public",
        dbUser.profile_picture
      );
      const fs = await import("fs");
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Atualizar perfil com novo avatar
    statements.updateUser.run(dbUser.name, dbUser.email, avatarUrl, user.id);

    return NextResponse.json({
      message: "Avatar atualizado com sucesso",
      url: avatarUrl,
    });
  } catch (error) {
    console.error("Erro ao fazer upload do avatar:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do avatar" },
      { status: 500 }
    );
  }
}

// Deletar avatar
export async function DELETE() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar usuário atual
    const dbUser = statements.getUser.get(user.id) as
      | {
          id: number;
          name: string;
          email: string;
          profile_picture: string | null;
        }
      | undefined;

    if (!dbUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Deletar arquivo se existir
    if (dbUser.profile_picture) {
      const filePath = path.join(
        process.cwd(),
        "public",
        dbUser.profile_picture
      );
      const fs = await import("fs");
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Atualizar banco de dados removendo o avatar
    statements.updateUser.run(dbUser.name, dbUser.email, null, user.id);

    return NextResponse.json({
      message: "Avatar removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover avatar:", error);
    return NextResponse.json(
      { error: "Erro ao remover avatar" },
      { status: 500 }
    );
  }
}
