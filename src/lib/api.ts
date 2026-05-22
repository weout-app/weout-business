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

function getToken(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("access_token") ?? "";
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "x-device-id": getDeviceId(),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

// ── Business Verification ──

export type VerificationInput = {
    businessName: string;
    businessType: string;
    street?: string;
    apt?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    lat?: number;
    lng?: number;
    isAffiliated: boolean;
    affiliationName?: string;
    description?: string;
};

export type BusinessDocument = {
    id: string;
    fileName: string;
    filePath: string;
    mimeType: string | null;
};

export type VerificationResult = {
    id: string;
    businessId: string;
    status: "Pending" | "Approved" | "Rejected";
    businessName?: string;
    businessType?: string;
    documents: BusinessDocument[];
};

export function submitVerification(input: VerificationInput) {
    return request<VerificationResult>("/business/verification", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function getVerificationStatus() {
    return request<VerificationResult | null>("/business/verification");
}

export async function uploadDocument(file: File): Promise<BusinessDocument> {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/business/verification/upload`, {
        method: "POST",
        headers: {
            "x-device-id": getDeviceId(),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    const json: ApiResponse<BusinessDocument> = await res.json();
    if (!json.ok) throw new Error(json.error.message);
    return json.result as BusinessDocument;
}

export function deleteDocument(docId: string) {
    return request<null>(`/business/verification/documents/${docId}`, {
        method: "DELETE",
    });
}

// ── Business Plans ──

export type PlanResult = {
    id: string;
    title: string;
    description: string;
    activityType: string;
    scheduledAt: string;
    status: string;
    coverPath: string | null;
    locationAddress: string | null;
    maxParticipants: number | null;
    totalReservations: number;
    repeatType: string | null;
    repeatDays: string | null;
    repeatMonthly: string | null;
};

export async function createPlan(formData: FormData): Promise<PlanResult> {
    const token = getToken();
    const res = await fetch(`${API_URL}/business/plans`, {
        method: "POST",
        headers: {
            "x-device-id": getDeviceId(),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    const json: ApiResponse<PlanResult> = await res.json();
    if (!json.ok) throw new Error(json.error.message);
    return json.result as PlanResult;
}

export function getBusinessPlans() {
    return request<PlanResult[]>("/business/plans");
}

// ── Business Chats ──

export type ChatPreview = {
    id: string;
    planId: string | null;
    planTitle: string;
    planCover: string | null;
    memberCount: number;
    memberNames: string[];
    lastMessage: {
        content: string;
        senderName: string;
        time: string;
    } | null;
    updatedAt: string;
};

export type ChatMessage = {
    id: string;
    content: string;
    time: string;
    isOwn: boolean;
    senderName: string;
    senderAvatar: string | null;
    senderId: string | null;
};

export function getBusinessChats() {
    return request<ChatPreview[]>("/business/chats");
}

export function getChatMessages(chatId: string) {
    return request<ChatMessage[]>(`/business/chats/${chatId}/messages`);
}

export function sendChatMessage(chatId: string, content: string) {
    return request<ChatMessage>(`/business/chats/${chatId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
    });
}
