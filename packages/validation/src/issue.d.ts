import { z } from 'zod';
export declare const createIssueSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["pothole", "water_leak", "streetlight", "garbage", "encroachment", "sewage", "other"]>;
    severity: z.ZodNumber;
    address: z.ZodString;
    ward: z.ZodString;
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    mediaUrl: z.ZodString;
    mediaPublicId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    mediaOriginalUrl: z.ZodOptional<z.ZodString>;
    mediaOptimizedUrl: z.ZodOptional<z.ZodString>;
    mediaThumbnailUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ward: string;
    title: string;
    description: string;
    category: "pothole" | "water_leak" | "streetlight" | "garbage" | "encroachment" | "sewage" | "other";
    severity: number;
    address: string;
    lat: number;
    lng: number;
    mediaUrl: string;
    mediaPublicId: string;
    mediaOriginalUrl?: string | undefined;
    mediaOptimizedUrl?: string | undefined;
    mediaThumbnailUrl?: string | undefined;
}, {
    ward: string;
    title: string;
    description: string;
    category: "pothole" | "water_leak" | "streetlight" | "garbage" | "encroachment" | "sewage" | "other";
    severity: number;
    address: string;
    lat: number;
    lng: number;
    mediaUrl: string;
    mediaPublicId?: string | undefined;
    mediaOriginalUrl?: string | undefined;
    mediaOptimizedUrl?: string | undefined;
    mediaThumbnailUrl?: string | undefined;
}>;
export declare const updateIssueStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["open", "verified", "in_progress", "resolved"]>;
    note: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "open" | "verified" | "in_progress" | "resolved";
    note: string;
}, {
    status: "open" | "verified" | "in_progress" | "resolved";
    note?: string | undefined;
}>;
export declare const getNearbyIssuesSchema: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    radius: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lng: number;
    radius?: number | undefined;
}, {
    lat: number;
    lng: number;
    radius?: number | undefined;
}>;
export declare const listIssuesQuerySchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    ward: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodNumber>;
    reporterId: z.ZodOptional<z.ZodString>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    distance: z.ZodOptional<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
    sort: z.ZodDefault<z.ZodOptional<z.ZodEnum<["latest", "votes", "priority"]>>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    sort: "latest" | "votes" | "priority";
    page: number;
    limit: number;
    status?: string | undefined;
    ward?: string | undefined;
    category?: string | undefined;
    severity?: number | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    reporterId?: string | undefined;
    distance?: number | undefined;
    cursor?: string | undefined;
}, {
    sort?: "latest" | "votes" | "priority" | undefined;
    status?: string | undefined;
    ward?: string | undefined;
    category?: string | undefined;
    severity?: number | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    reporterId?: string | undefined;
    distance?: number | undefined;
    cursor?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
//# sourceMappingURL=issue.d.ts.map