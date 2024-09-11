"use server";
import { cookies, headers } from "next/headers";
import { addUser } from "../supabase/users/mutations";
import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase-server";
import { revalidatePath } from "next/cache";

export async function actionLoginUser(email: string, password: string) {
  const supabase = createClient();
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (response.error) {
    return { error: { message: response.error.message } };
  }
  revalidatePath("/", "layout");
  return { error: null };
}

export async function actionResetPassword(email: string) {
  const origin = headers().get("origin");
  const supabase = createClient();
  const response = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}reset-password`,
  });
  if (response.error) {
    return { error: { message: response.error.message } };
  }
  revalidatePath("/", "layout");
  return { error: null };
}

export async function actionUpdatePassword(password: string) {
  const supabase = createClient();
  const response = await supabase.auth.updateUser({
    password: password,
  });

  if (response.error) {
    return { error: { message: response.error.message } };
  }
  revalidatePath("/", "layout");
  return { error: null };
}

export async function actionSignUpUser(
  email: string,
  password: string,
  first_name: string,
  last_name: string
) {
  const supabase = createClient();

  const response = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}api/auth/callback`,
    },
  });

  try {
    const createEntryInUsersTable = await addUser(
      response.data.user?.id,
      email,
      first_name,
      last_name,
      "student",
      null,
      null,
      null,
      null,
      "9999"
    );
  } catch (e) {}

  if (response.error) {
    // Convert the error object into a plain object
    return { error: { message: response.error.message } };
  }

  return { data: { user: response.data.user } }; // Ensure only serializable data is returned
}

export async function actionLogoutUser() {
  "use server";
  const supabase = createClient();
  await supabase.auth.signOut();
}
