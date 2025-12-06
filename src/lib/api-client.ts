type ApiClientOptions = RequestInit & {
  headers?: Record<string, string>;
};

export async function apiFetch<TResponse>(
  path: string,
  options: ApiClientOptions = {},
): Promise<TResponse> {
  const response = await fetch(path, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `API ${response.status} ${response.statusText}: ${message || "Request failed"}`,
    );
  }

  return response.json() as Promise<TResponse>;
}
