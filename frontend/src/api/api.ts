const API_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiOptions extends RequestInit {
    token?: string | null;
}

export async function apiRequest<T>(
    endpoint: string,
    options: ApiOptions = {},
): Promise<T> {
    const { token, headers, ...requestOptions } = options;

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...requestOptions,
        headers: {
            ...(requestOptions.body instanceof FormData
                ? {}
                : { 'Content-Type': 'application/json' }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = Array.isArray(data?.message)
            ? data.message.join(', ')
            : data?.message || 'Something went wrong';

        throw new Error(message);
    }

    return data as T;
}