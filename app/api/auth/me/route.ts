import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// API pour obtenir l'utilisateur connecté
export async function GET(req: Request) {
  console.log("🔹 API /me : Vérification de la session...");
  const session = await getServerSession(authOptions);

  console.log("🟡 Session API /me :", session);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Vous n'êtes pas connecté" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    }
  });

  if (!user) {
    return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 400 });
  }

  return NextResponse.json(user);
}
