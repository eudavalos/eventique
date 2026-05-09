type ErrorWithResponse = {
  response?: {
    data?: unknown;
    status?: number;
  };
  message?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function uniqueMessages(messages: string[]): string[] {
  return Array.from(new Set(messages.map((msg) => msg.trim()).filter(Boolean)));
}

export function formatApiErrorDetail(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    const messages = uniqueMessages(
      value
        .map((item) => formatApiErrorDetail(item))
        .filter((message): message is string => Boolean(message)),
    );
    return messages.length ? messages.join(' ') : null;
  }

  if (isRecord(value)) {
    for (const key of ['msg', 'message', 'detail', 'error']) {
      const message = formatApiErrorDetail(value[key]);
      if (message) return message;
    }

    const loc = Array.isArray(value.loc)
      ? value.loc.filter((part) => typeof part === 'string' || typeof part === 'number').join('.')
      : '';
    const type = typeof value.type === 'string' ? value.type : '';
    const contextual = [loc ? `Campo ${loc}` : '', type ? `(${type})` : ''].filter(Boolean).join(' ');
    return contextual || null;
  }

  return null;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Ocurrio un error. Intenta de nuevo.',
): string {
  const err = error as ErrorWithResponse;
  const data = err?.response?.data;

  if (isRecord(data)) {
    const message =
      formatApiErrorDetail(data.detail) ??
      formatApiErrorDetail(data.message) ??
      formatApiErrorDetail(data.error);
    if (message) return message;
  }

  return formatApiErrorDetail(data) ?? formatApiErrorDetail(err?.message) ?? fallback;
}
