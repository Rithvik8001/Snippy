import { auth } from "@clerk/nextjs/server";

export async function getCurrentUserId() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

export async function getCurrentUser() {
  const { userId } = await auth();
  return userId;
}
