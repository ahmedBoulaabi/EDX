"use server";
import { createClient } from "./supabase-server";

export async function getCurrentSession() {
  "use server";
  const supabaseServerClient = createClient();
  const userData = await supabaseServerClient.auth.getUser();
  return userData;
}
