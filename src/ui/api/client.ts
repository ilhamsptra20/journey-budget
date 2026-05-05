export type ApiEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
};

export class ApiClientError extends Error {
  statusCode: number;
  details: unknown;

  constructor(message: string, statusCode: number, details: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  let payload: ApiEnvelope<T> | null = null;

  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiClientError("Invalid server response", response.status, null);
  }

  if (!response.ok || !payload.status) {
    throw new ApiClientError(payload.message, response.status, payload.data);
  }

  return payload.data;
}

export const apiClient = {
  get<T>(path: string) {
    return request<T>(path, { method: "GET", cache: "no-store" });
  },
  post<T, B = unknown>(path: string, body: B) {
    return request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  patch<T, B = unknown>(path: string, body: B) {
    return request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  del<T>(path: string) {
    return request<T>(path, { method: "DELETE" });
  },
};
