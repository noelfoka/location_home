import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// api pour suprimer un utilisateur
export async function DELETE(request: Request,{params}: {params: {id: string}}) {
  const user = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 400 });
  }

  await prisma.user.delete({
    where: {
      id: params.id,
    },
  });

  return NextResponse.json({ message: "Utilisateur supprimé avec succès" }, { status: 200 });
}