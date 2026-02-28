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
        <p className="text-xs uppercase tracking-[0.28em] text-blue-200/80">Admin access</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-100 sm:text-4xl">Logga in</h1>
        <p className="mt-4 text-sm text-slate-300">
          Registrering är stängd. Adminkonto skapas via Supabase dashboard och markeras med <code>profiles.is_admin</code>.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">E-post</span>
            <input
              type="email"
              {...register("email")}
              className="glass-input w-full px-4 py-3 text-sm focus:border-amber-300/75 focus:outline-none"
              placeholder="admin@domain.com"
            />
            {errors.email ? <p className="mt-1 text-xs text-rose-300">{errors.email.message}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Lösenord</span>
            <input
              type="password"
              {...register("password")}
              className="glass-input w-full px-4 py-3 text-sm focus:border-amber-300/75 focus:outline-none"
              placeholder="••••••••"
            />
            {errors.password ? <p className="mt-1 text-xs text-rose-300">{errors.password.message}</p> : null}
          </label>

          {authError ? (
            <p className="rounded-xl border border-rose-400/40 bg-rose-500/12 px-3 py-2 text-sm text-rose-200">{authError}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary-amber w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Loggar in..." : "Logga in"}
          </button>
        </form>
      </div>
    </main>
  );
}
