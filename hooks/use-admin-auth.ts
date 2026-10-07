import { useEffect, useState, useMemo } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";

type Profile = {
  id: string;
  user_id?: string;
  role: string;
  full_name: string | null;
  [key: string]: any;
};

export function useAdminAuth() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAuth(currentSession: Session | null) {
      if (!currentSession) {
        if (mounted) {
          setIsAdmin(false);
          setProfile(null);
          setIsLoading(false);
        }
        return;
      }

      let { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", currentSession.user.id)
        .single();
      
      if (!data) {
        const { data: fallbackData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentSession.user.id)
          .single();
        data = fallbackData;
      }

      if (mounted) {
        setProfile(data);
        setIsAdmin(data?.role === 'admin');
        setIsLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (mounted) {
        setSession(initialSession);
        checkAuth(initialSession);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        setIsLoading(true);
        checkAuth(currentSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { isAdmin, isLoading, profile, session };
}
