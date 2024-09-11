"use client";
import { AuthUser, SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { getUserData } from "../supabase/users/queries";
import { createClient } from "../utils/supabase-client";
import { revalidatePath } from "next/cache";

type SupabaseUserContextType = {
  supabase: SupabaseClient | null;
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
};

const SupabaseUserContext = createContext<SupabaseUserContextType>({
  supabase: null,
  user: null,
  role: null,
  loading: false,
});

export const useSupabaseUser = () => {
  return useContext(SupabaseUserContext);
};

interface SupabaseUserProviderProps {
  children: React.ReactNode;
}

export const SupabaseUserProvider = ({
  children,
}: SupabaseUserProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const supabaseClient = createClient();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      setSupabase(supabaseClient);
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (user) {
        setUser(user);
        const userData = await getUserData(user.id);
        setRole(userData.role);
      }
      setLoading(false);
    };
    getUser();
  }, [supabaseClient]);

  return (
    <SupabaseUserContext.Provider value={{ supabase, user, role, loading }}>
      {children}
    </SupabaseUserContext.Provider>
  );
};
