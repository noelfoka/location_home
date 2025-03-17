import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// api pour changer le role d'un utilisateur
export async function PATCH(request: Request,{params}: {params: {id: string}}) {

  const { role } = await request.json();

  const validRole = ["LOCATAIRE", "PROPRIETAIRE", "ADMINISTRATEUR"];

  if (!validRole.includes(role)) {
    return NextResponse.json({ message: "Role invalide" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: params.id
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 400 });
  }

  await prisma.user.update({
    where: {
      id: params.id,
    },
    data: {
      role,
    },
  });

  return NextResponse.json({ message: "Role modifié avec succès" }, { status: 200 });

}