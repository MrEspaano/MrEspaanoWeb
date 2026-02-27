import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { AuthError, requireAdminContext } from "@/lib/auth";
import { normalizeHubDesignConfig } from "@/lib/design-config";
import { settingsFormSchema } from "@/lib/validation";

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : "Ett oväntat fel uppstod";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function PUT(request: Request) {
  try {
    const { supabase } = await requireAdminContext();
    const body = await request.json();

    const parsed = settingsFormSchema.safeParse({
      displayName: body.displayName,
      tagline: body.tagline,
      bio: body.bio,
      heroCtaPrimary: body.heroCtaPrimary,
      heroCtaSecondary: body.heroCtaSecondary,
      designConfig: normalizeHubDesignConfig(body.designConfig),
      socialLinks: {
        github: body.github || undefined,
        linkedin: body.linkedin || undefined,
        x: body.x || undefined,
        email: body.email || undefined
      }
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ogiltiga inställningar" }, { status: 400 });
    }

    const { error } = await supabase.from("site_settings").upsert({
      id: true,
      display_name: parsed.data.displayName,
      tagline: parsed.data.tagline,
      bio: parsed.data.bio,
      hero_cta_primary: parsed.data.heroCtaPrimary,
      hero_cta_secondary: parsed.data.heroCtaSecondary,
      design_config: parsed.data.designConfig,
      social_links: {
        github: parsed.data.socialLinks.github,
        linkedin: parsed.data.socialLinks.linkedin,
        x: parsed.data.socialLinks.x,
        email: parsed.data.socialLinks.email ? `mailto:${parsed.data.socialLinks.email}` : undefined
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin/settings");

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
