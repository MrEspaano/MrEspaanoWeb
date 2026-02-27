import type { SupabaseClient } from "@supabase/supabase-js";

const SIGNED_URL_TTL = 60 * 60;

export async function createSignedMediaUrl(
  supabase: SupabaseClient,
  path: string | undefined
): Promise<string | null> {
  if (!path) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from("project-media")
    .createSignedUrl(path, SIGNED_URL_TTL);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export async function createSignedMediaUrls(
  supabase: SupabaseClient,
  paths: string[] | undefined
): Promise<string[]> {
  if (!paths?.length) {
    return [];
  }

  const signed = await Promise.all(paths.map((path) => createSignedMediaUrl(supabase, path)));
  return signed.filter(Boolean) as string[];
}
