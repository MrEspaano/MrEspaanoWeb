import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { AuthError, requireAdminContext } from "@/lib/auth";
import { projectFormSchema, projectVisualsSchema } from "@/lib/validation";
import { csvToArray, slugify, toOptionalUrl } from "@/lib/utils";

interface ParsedExistingVisuals {
  coverPath?: string;
  galleryPaths: string[];
}

function parseProjectPayload(formData: FormData) {
  const payload = {
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    shortDescription: String(formData.get("shortDescription") ?? "").trim(),
    longDescription: String(formData.get("longDescription") ?? "").trim(),
    category: String(formData.get("category") ?? "") as "app" | "game" | "site",
    status: String(formData.get("status") ?? "") as "live" | "wip" | "archived",
    tags: csvToArray(String(formData.get("tags") ?? "")),
    techStack: csvToArray(String(formData.get("techStack") ?? "")),
    links: {
      demoUrl: toOptionalUrl(String(formData.get("demoUrl") ?? "")),
      repoUrl: toOptionalUrl(String(formData.get("repoUrl") ?? "")),
      caseStudyUrl: toOptionalUrl(String(formData.get("caseStudyUrl") ?? ""))
    }
  };

  return projectFormSchema.safeParse(payload);
}

function parseExistingVisuals(formData: FormData): ParsedExistingVisuals {
  const coverPath = String(formData.get("existingCoverPath") ?? "").trim() || undefined;
  const galleryRaw = String(formData.get("existingGalleryPaths") ?? "[]");

  try {
    const parsed = JSON.parse(galleryRaw);
    return {
      coverPath,
      galleryPaths: Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === "string") : []
    };
  } catch {
    return { coverPath, galleryPaths: [] };
  }
}

async function uploadSingleFile(
  file: File | null,
  folder: "project-covers" | "project-gallery",
  projectId: string,
  supabase: Awaited<ReturnType<typeof requireAdminContext>>["supabase"]
) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const ext = file.name.split(".").pop() || "webp";
  const base = slugify(file.name.replace(`.${ext}`, "")) || "asset";
  const path = `${folder}/${projectId}/${Date.now()}-${base}.${ext}`;

  const { error } = await supabase.storage.from("project-media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined
  });

  if (error) {
    throw new Error(`Kunde inte ladda upp fil: ${error.message}`);
  }

  return path;
}

async function uploadGalleryFiles(
  files: File[],
  projectId: string,
  supabase: Awaited<ReturnType<typeof requireAdminContext>>["supabase"]
) {
  const paths: string[] = [];

  for (const file of files) {
    const path = await uploadSingleFile(file, "project-gallery", projectId, supabase);
    if (path) {
      paths.push(path);
    }
  }

  return paths;
}

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : "Ett oväntat fel uppstod";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdminContext();
    const formData = await request.formData();
    const parsed = parseProjectPayload(formData);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ogiltig projektdata" }, { status: 400 });
    }

    const projectId = crypto.randomUUID();
    const coverFile = formData.get("coverFile") as File | null;
    const galleryFiles = formData
      .getAll("galleryFiles")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const [coverPath, galleryPaths] = await Promise.all([
      uploadSingleFile(coverFile, "project-covers", projectId, supabase),
      uploadGalleryFiles(galleryFiles, projectId, supabase)
    ]);

    const visualsParsed = projectVisualsSchema.safeParse({
      coverPath: coverPath ?? undefined,
      galleryPaths
    });

    if (!visualsParsed.success) {
      return NextResponse.json({ error: "Ogiltig media-data för projektet" }, { status: 400 });
    }

    const { error } = await supabase.from("projects").insert({
      id: projectId,
      slug: parsed.data.slug,
      title: parsed.data.title,
      short_description: parsed.data.shortDescription,
      long_description: parsed.data.longDescription,
      category: parsed.data.category,
      status: parsed.data.status,
      tags: parsed.data.tags,
      tech_stack: parsed.data.techStack,
      links: parsed.data.links,
      visuals: visualsParsed.data
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin/projects");

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const { supabase } = await requireAdminContext();
    const formData = await request.formData();
    const projectId = String(formData.get("id") ?? "").trim();

    if (!projectId) {
      return NextResponse.json({ error: "Project id saknas" }, { status: 400 });
    }

    const parsed = parseProjectPayload(formData);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ogiltig projektdata" }, { status: 400 });
    }

    const existingVisuals = parseExistingVisuals(formData);
    const coverFile = formData.get("coverFile") as File | null;
    const galleryFiles = formData
      .getAll("galleryFiles")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const [newCoverPath, newGalleryPaths] = await Promise.all([
      uploadSingleFile(coverFile, "project-covers", projectId, supabase),
      uploadGalleryFiles(galleryFiles, projectId, supabase)
    ]);

    if (newCoverPath && existingVisuals.coverPath && existingVisuals.coverPath !== newCoverPath) {
      await supabase.storage.from("project-media").remove([existingVisuals.coverPath]);
    }

    const mergedGalleryPaths = [...existingVisuals.galleryPaths, ...newGalleryPaths];
    const visualsParsed = projectVisualsSchema.safeParse({
      coverPath: newCoverPath ?? existingVisuals.coverPath,
      galleryPaths: mergedGalleryPaths
    });

    if (!visualsParsed.success) {
      return NextResponse.json({ error: "Ogiltig media-data för projektet" }, { status: 400 });
    }

    const { error } = await supabase
      .from("projects")
      .update({
        slug: parsed.data.slug,
        title: parsed.data.title,
        short_description: parsed.data.shortDescription,
        long_description: parsed.data.longDescription,
        category: parsed.data.category,
        status: parsed.data.status,
        tags: parsed.data.tags,
        tech_stack: parsed.data.techStack,
        links: parsed.data.links,
        visuals: visualsParsed.data
      })
      .eq("id", projectId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin/projects");
    revalidatePath(`/projects/${parsed.data.slug}`);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { supabase } = await requireAdminContext();
    const body = (await request.json()) as { id?: string };
    const projectId = body.id?.trim();

    if (!projectId) {
      return NextResponse.json({ error: "Project id saknas" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("projects")
      .select("visuals, slug")
      .eq("id", projectId)
      .maybeSingle();

    const visuals = (existing?.visuals as { coverPath?: string; galleryPaths?: string[] } | null) ?? null;
    const filePaths = [visuals?.coverPath, ...(visuals?.galleryPaths ?? [])].filter(
      (path): path is string => Boolean(path)
    );

    const { error } = await supabase.from("projects").delete().eq("id", projectId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (filePaths.length) {
      await supabase.storage.from("project-media").remove(filePaths);
    }

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin/projects");

    if (existing?.slug) {
      revalidatePath(`/projects/${existing.slug}`);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
