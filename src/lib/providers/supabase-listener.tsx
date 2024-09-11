"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSupabaseUser } from "./supabase-user-provider";
import { createClient } from "../utils/supabase-client";

export default function SupabaseListener({
  serverAccessToken,
}: {
  serverAccessToken?: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AUTH CHANGE", event);
      // router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [serverAccessToken, router, supabase]);

  return null;
}
