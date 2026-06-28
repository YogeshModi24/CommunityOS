"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapMongoUser = mapMongoUser;
exports.mapMongoIssue = mapMongoIssue;
exports.mapMongoUserSession = mapMongoUserSession;
exports.mapMongoNotification = mapMongoNotification;
function mapMongoUser(doc) {
    if (!doc)
        return null;
    return {
        id: doc._id ? doc._id.toString() : '',
        name: doc.name,
        email: doc.email,
        password: doc.password,
        role: doc.role,
        ward: doc.ward,
        points: doc.points ?? 0,
        issues_reported: doc.issues_reported ?? 0,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
function mapMongoIssue(doc) {
    if (!doc)
        return null;
    let reporter;
    if (typeof doc.reporter_id === 'object' && doc.reporter_id !== null && '_id' in doc.reporter_id) {
        reporter = {
            id: doc.reporter_id._id.toString(),
            name: doc.reporter_id.name,
            points: doc.reporter_id.points,
            ward: doc.reporter_id.ward,
        };
    }
    else {
        reporter = doc.reporter_id ? doc.reporter_id.toString() : '';
    }
    return {
        id: doc._id ? doc._id.toString() : '',
        title: doc.title,
        description: doc.description,
        category: doc.category,
        severity: doc.severity,
        status: doc.status,
        ai_status: doc.ai_status ?? 'pending',
        priority_score: doc.priority_score ?? 0,
        location: {
            type: doc.location?.type ?? 'Point',
            coordinates: [doc.location?.coordinates[0] ?? 0, doc.location?.coordinates[1] ?? 0],
        },
        address: doc.address ?? '',
        ward: doc.ward ?? '',
        media: (doc.media || []).map((m) => ({
            url: m.url,
            originalUrl: m.originalUrl ?? m.url,
            optimizedUrl: m.optimizedUrl ?? m.url,
            thumbnailUrl: m.thumbnailUrl ?? m.url,
            public_id: m.public_id ?? '',
        })),
        ai_category: doc.ai_category,
        ai_confidence: doc.ai_confidence,
        ai_description: doc.ai_description,
        hazardous: doc.hazardous ?? false,
        ai_analysis: doc.ai_analysis,
        votes: doc.votes ?? 0,
        voter_ids: (doc.voter_ids || []).map((v) => v.toString()),
        reporter_id: reporter,
        status_history: (doc.status_history || []).map((h) => ({
            status: h.status,
            note: h.note ?? '',
            timestamp: h.timestamp,
        })),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
function mapMongoUserSession(doc) {
    if (!doc)
        return null;
    return {
        id: doc._id ? doc._id.toString() : '',
        userId: doc.userId ? doc.userId.toString() : '',
        tenantId: doc.tenantId ?? 'default',
        refreshTokenHash: doc.refreshTokenHash,
        device: {
            deviceName: doc.device?.deviceName,
            browser: doc.device?.browser,
            platform: doc.device?.platform,
            os: doc.device?.os,
            appVersion: doc.device?.appVersion,
        },
        ipAddress: doc.ipAddress,
        isActive: doc.isActive ?? true,
        version: doc.version ?? 1,
        createdAt: doc.createdAt,
        lastUsedAt: doc.lastUsedAt,
        lastActivityAt: doc.lastActivityAt,
        expiresAt: doc.expiresAt,
        revokedAt: doc.revokedAt,
        revokedReason: doc.revokedReason,
    };
}
function mapMongoNotification(doc) {
    if (!doc)
        return null;
    return {
        id: doc._id ? doc._id.toString() : '',
        userId: doc.userId ? doc.userId.toString() : '',
        title: doc.title,
        message: doc.message,
        type: doc.type,
        issueId: doc.issueId ? doc.issueId.toString() : undefined,
        metadata: doc.metadata
            ? doc.metadata instanceof Map
                ? Object.fromEntries(doc.metadata)
                : doc.metadata
            : undefined,
        read: doc.read ?? false,
        createdAt: doc.createdAt,
        readAt: doc.readAt,
    };
}
