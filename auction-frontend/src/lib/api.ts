import type { User } from "@/types/models";

const API_URL = process.env.NEXT_API_URL ?? "http://localhost:8000";

class ApiError extends Error{
    status: number;
    constructor(status: number, message: string){
        super(message);
        this.status = status 
    }
}

async function request<T>(
    path: string, 
    options: RequestInit & { token? : string} = {}
): Promise<T> {
    const { token, headers, ...rest } = options;
    const res = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers: {
            "Content-Type": "application/json",
            ...(token? {Authorization: `Bearer ${token}`}: {}),
            ...headers,
        },
    });

    // console.log(res);

    if(!res.ok){
        const body = await res.json().catch(() => ({ detail: res.statusText }));
        throw new ApiError(res.status, body.detail ?? "request_failed");
    }
    if(res.status === 204) return undefined as T;
    return res.json();
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export const api = {
    register: (email: string, username: string, password: string, role: string) => 
        request<AuthResponse>("/api/v1/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, username, password, role }),
        }),
}

export { ApiError }