const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/v1";

type ApiOk<T> = { ok: true; result: T };
type ApiFail = { ok: false; error: { code: string; message: string } };
type ApiResponse<T> = ApiOk<T> | ApiFail;

function getDeviceId(): string {
    if (typeof window === "undefined") return "server";
    let id = localStorage.getItem("weout_device_id");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("weout_device_id", id);
    }
    return id;
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "x-device-id": getDeviceId(),
            ...options.headers,
        },
    });

    const json: ApiResponse<T> = await res.json();

    if (!json.ok) {
        throw new Error(json.error.message);
    }

    return json.result as T;
}

// ── Business Auth ──

export type SignupInput = {
    email: string;
    password: string;
    businessName: string;
    contactName: string;
    phone: string;
};

export type SignupResult = {
    ok: true;
    message: string;
    business: { id: string; email: string; businessName: string };
};

export type LoginResult = {
    ok: true;
    accessToken: string;
    refreshToken: string;
    business: { id: string; email: string; businessName: string; contactName: string };
};

export function signup(input: SignupInput) {
    return request<SignupResult>("/business-auth/signup", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function login(input: { email: string; password: string }) {
    return request<LoginResult>("/business-auth/login", {
        method: "POST",
        body: JSON.stringify(input),
    });
}
