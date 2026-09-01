interface SupabaseRequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  serviceRole?: boolean;
  prefer?: string;
}

function baseUrl(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/u, "") || null;
}

function keyFor(serviceRole: boolean): string | null {
  if (serviceRole) return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
}

export function hasSupabaseReadConfig(): boolean {
  return Boolean(baseUrl() && keyFor(false));
}

export function hasSupabaseServiceConfig(): boolean {
  return Boolean(baseUrl() && keyFor(true));
}

export async function supabaseRest<T>(path: string, options: SupabaseRequestOptions = {}): Promise<T> {
  const serviceRole = options.serviceRole ?? false;
  const url = baseUrl();
  const key = keyFor(serviceRole);

  if (!url || !key) {
    throw new Error(serviceRole ? "Supabase service-role configuration is missing." : "Supabase public configuration is missing.");
  }

  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
