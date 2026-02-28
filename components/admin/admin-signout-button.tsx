"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminSignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="btn-secondary-dark px-4 py-2 text-sm"
    >
      Logga ut
    </button>
  );
}
