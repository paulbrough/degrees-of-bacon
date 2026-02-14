import { createServerClient } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function getAuthUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getAuthUserId(): Promise<string | null> {
  const user = await getAuthUser();
  return user?.id ?? null;
}

export async function ensurePrismaUser(authId: string, email: string): Promise<void> {
  await prisma.user.upsert({
    where: { id: authId },
    update: { email },
    create: { id: authId, email },
  });
}
