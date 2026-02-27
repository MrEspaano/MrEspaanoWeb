"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Ange en giltig e-post"),
  password: z.string().min(8, "Lösenord måste vara minst 8 tecken")
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface AdminLoginFormProps {
  error?: string;
}

export function AdminLoginForm({ error }: AdminLoginFormProps) {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(
    error === "unauthorized" ? "Kontot saknar admin-behörighet." : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });

    if (signInError) {
      setAuthError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/projects");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="admin-surface w-full max-w-xl rounded-3xl p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/80">Admin access</p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Logga in</h1>
        <p className="mt-4 text-sm text-white/75">
          Registrering är stängd. Adminkonto skapas via Supabase dashboard och markeras med <code>profiles.is_admin</code>.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">E-post</span>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 focus:border-cyan-200/70 focus:outline-none"
              placeholder="admin@domain.com"
            />
            {errors.email ? <p className="mt-1 text-xs text-rose-200">{errors.email.message}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/60">Lösenord</span>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 focus:border-cyan-200/70 focus:outline-none"
              placeholder="••••••••"
            />
            {errors.password ? <p className="mt-1 text-xs text-rose-200">{errors.password.message}</p> : null}
          </label>

          {authError ? <p className="rounded-xl border border-rose-300/40 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">{authError}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl border border-cyan-200/60 bg-cyan-200/20 px-4 py-3 text-sm font-semibold text-cyan-50 transition hover:border-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Loggar in..." : "Logga in"}
          </button>
        </form>
      </div>
    </main>
  );
}
