import { createSupabaseServerClient } from "@/lib/supabase/server";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getCurrentAdminContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { supabase, user: null, isAdmin: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    isAdmin: Boolean(profile?.is_admin)
  };
}

export async function requireAdminContext() {
  const context = await getCurrentAdminContext();

  if (!context.user) {
    throw new AuthError("Ej inloggad", 401);
  }

  if (!context.isAdmin) {
    throw new AuthError("Saknar admin-behörighet", 403);
  }

  return context;
}
