import { profile as sourceProfile, type PortfolioProfile } from "@/data/profile";

export type PortfolioSource = "supabase" | "source";

export type PortfolioReadResult = {
  profile: PortfolioProfile;
  source: PortfolioSource;
  reason?: string;
  updatedAt?: string | null;
  supabaseConfigured: boolean;
  canWrite: boolean;
  table: string;
  recordId: string;
};

const defaultTable = "portfolio_profiles";
const defaultRecordId = "default";

type MutableRecord = Record<string, unknown>;

function objectValue(value: unknown): MutableRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as MutableRecord : {};
}

function arrayValue<T>(value: unknown, fallback: readonly T[]): T[] {
  return Array.isArray(value) ? value as T[] : [...fallback];
}

function normalizeProject(project: unknown, fallbackProject: PortfolioProfile["projects"][number]) {
  const raw = objectValue(project);
  const fallback = fallbackProject as unknown as MutableRecord;
  const rawCaseStudy = objectValue(raw.caseStudy);
  const fallbackCaseStudy = objectValue(fallback.caseStudy);
  const rawMedia = objectValue(raw.media);
  const fallbackMedia = objectValue(fallback.media);

  return {
    ...fallbackProject,
    ...raw,
    contributions: arrayValue(raw.contributions, fallbackProject.contributions),
    technologies: arrayValue(raw.technologies, fallbackProject.technologies),
    media: {
      ...fallbackMedia,
      ...rawMedia,
      assets: arrayValue(rawMedia.assets, Array.isArray(fallbackMedia.assets) ? fallbackMedia.assets as never[] : []),
    },
    caseStudy: {
      ...fallbackCaseStudy,
      ...rawCaseStudy,
      process: arrayValue(rawCaseStudy.process, fallbackProject.caseStudy.process),
      lessons: arrayValue(rawCaseStudy.lessons, fallbackProject.caseStudy.lessons),
    },
  } as unknown as PortfolioProfile["projects"][number];
}

export function normalizePortfolioProfile(input: unknown): PortfolioProfile {
  const source = sourceProfile as unknown as MutableRecord;
  const raw = objectValue(input);
  const rawCareerSummary = objectValue(raw.careerSummary);
  const sourceCareerSummary = objectValue(source.careerSummary);
  const rawContact = objectValue(raw.contact);
  const sourceContact = objectValue(source.contact);
  const rawMedia = objectValue(raw.media);
  const sourceMedia = objectValue(source.media);
  const rawSocial = objectValue(raw.social);
  const sourceSocial = objectValue(source.social);
  const sourceProjects = sourceProfile.projects;
  const inputProjects = Array.isArray(raw.projects) ? raw.projects : sourceProjects;

  return {
    ...sourceProfile,
    ...raw,
    media: { ...sourceMedia, ...rawMedia },
    specialties: arrayValue(raw.specialties, sourceProfile.specialties),
    about: arrayValue(raw.about, sourceProfile.about),
    careerSummary: {
      ...sourceCareerSummary,
      ...rawCareerSummary,
      highlights: arrayValue(rawCareerSummary.highlights, sourceProfile.careerSummary.highlights),
    },
    experience: arrayValue(raw.experience, sourceProfile.experience),
    projects: inputProjects.map((project, index) => normalizeProject(project, sourceProjects[index] ?? sourceProjects[0])),
    skillGroups: arrayValue(raw.skillGroups, sourceProfile.skillGroups),
    education: arrayValue(raw.education, sourceProfile.education),
    certifications: arrayValue(raw.certifications, sourceProfile.certifications),
    workingProcess: arrayValue(raw.workingProcess, sourceProfile.workingProcess),
    contact: {
      ...sourceContact,
      ...rawContact,
      preferredTopics: arrayValue(rawContact.preferredTopics, sourceProfile.contact.preferredTopics),
      methods: arrayValue(rawContact.methods, sourceProfile.contact.methods),
    },
    social: { ...sourceSocial, ...rawSocial },
  } as unknown as PortfolioProfile;
}

export const cmsConfig = {
  table: process.env.SUPABASE_PORTFOLIO_TABLE || defaultTable,
  recordId: process.env.SUPABASE_PORTFOLIO_ID || defaultRecordId,
  revalidateSeconds: Number(process.env.PORTFOLIO_REVALIDATE_SECONDS || 60),
};

function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") || "";
}

function anonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function readKey() {
  return serviceKey() || anonKey();
}

function friendlySupabaseError(status: number, errorText: string) {
  let message = errorText || `Supabase request failed with status ${status}.`;

  try {
    const parsed = JSON.parse(errorText) as { code?: string; message?: string; hint?: string | null };
    if (parsed.code === "PGRST205" || parsed.message?.includes("schema cache")) {
      message = `Supabase table '${cmsConfig.table}' is missing or not visible in the schema cache. Run supabase/schema.sql in the same Supabase project, wait 30-60 seconds, then try Load live / Save live again.`;
    } else if (parsed.message) {
      message = parsed.hint ? `${parsed.message} Hint: ${parsed.hint}` : parsed.message;
    }
  } catch {
    if (errorText.includes("PGRST205") || errorText.includes("schema cache")) {
      message = `Supabase table '${cmsConfig.table}' is missing or not visible in the schema cache. Run supabase/schema.sql in the same Supabase project, wait 30-60 seconds, then try Load live / Save live again.`;
    }
  }

  return message;
}

export function isSupabaseReadConfigured() {
  return Boolean(supabaseUrl() && readKey());
}

export function isSupabaseWriteConfigured() {
  return Boolean(supabaseUrl() && serviceKey());
}

export function isAdminPasswordValid(password: string | null) {
  const expected = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "huyvo-admin";
  return Boolean(password && password === expected);
}

function profileEndpoint(select = "data,updated_at") {
  const params = new URLSearchParams({
    id: `eq.${cmsConfig.recordId}`,
    select,
    limit: "1",
  });
  return `${supabaseUrl()}/rest/v1/${cmsConfig.table}?${params.toString()}`;
}

export async function readPortfolioProfile(options?: { noStore?: boolean }): Promise<PortfolioReadResult> {
  const table = cmsConfig.table;
  const recordId = cmsConfig.recordId;
  const supabaseConfigured = isSupabaseReadConfigured();
  const canWrite = isSupabaseWriteConfigured();

  if (!supabaseConfigured) {
    return {
      profile: normalizePortfolioProfile(sourceProfile),
      source: "source",
      reason: "Supabase environment variables are not configured. Using src/data/profile.ts fallback.",
      supabaseConfigured,
      canWrite,
      table,
      recordId,
    };
  }

  try {
    const key = readKey();
    const response = await fetch(profileEndpoint(), {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: options?.noStore ? "no-store" : undefined,
      next: options?.noStore ? undefined : { revalidate: cmsConfig.revalidateSeconds },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        profile: normalizePortfolioProfile(sourceProfile),
        source: "source",
        reason: `Supabase read failed (${response.status}). ${friendlySupabaseError(response.status, errorText)}`,
        supabaseConfigured,
        canWrite,
        table,
        recordId,
      };
    }

    const rows = (await response.json()) as Array<{ data?: PortfolioProfile; updated_at?: string | null }>;
    const row = rows[0];

    if (!row?.data) {
      return {
        profile: normalizePortfolioProfile(sourceProfile),
        source: "source",
        reason: `No Supabase record found for id '${recordId}'. Using fallback profile until you save from /admin.`,
        supabaseConfigured,
        canWrite,
        table,
        recordId,
      };
    }

    return {
      profile: normalizePortfolioProfile(row.data),
      source: "supabase",
      updatedAt: row.updated_at ?? null,
      supabaseConfigured,
      canWrite,
      table,
      recordId,
    };
  } catch (error) {
    return {
      profile: normalizePortfolioProfile(sourceProfile),
      source: "source",
      reason: error instanceof Error ? error.message : "Unexpected Supabase read error. Using fallback profile.",
      supabaseConfigured,
      canWrite,
      table,
      recordId,
    };
  }
}

export async function getPortfolioProfile() {
  const result = await readPortfolioProfile();
  return result.profile;
}

export async function savePortfolioProfile(data: PortfolioProfile) {
  const normalizedData = normalizePortfolioProfile(data);
  if (!isSupabaseWriteConfigured()) {
    throw new Error("Supabase write is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const key = serviceKey();
  const response = await fetch(`${supabaseUrl()}/rest/v1/${cmsConfig.table}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id: cmsConfig.recordId,
      data: normalizedData,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(friendlySupabaseError(response.status, errorText));
  }

  return response.json() as Promise<Array<{ id: string; updated_at: string }>>;
}
