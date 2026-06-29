import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAuthenticatedUser, SIGN_IN_PATH } from "@/lib/auth";

export const getSessionUser = cache(async () => {
  const cookieStore = await cookies();
  return getAuthenticatedUser(cookieStore);
});

export async function getRequiredSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect(SIGN_IN_PATH);
  }

  return user;
}
