import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: z.string().min(1, 'Description is required').trim(),
  category: z.enum([
    'pothole',
    'water_leak',
    'streetlight',
    'garbage',
    'encroachment',
    'sewage',
    'other',
  ]),
  severity: z.coerce.number().int().min(1).max(5),
  address: z.string().min(1, 'Address is required').trim(),
  ward: z.string().min(1, 'Ward is required').trim(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  mediaUrl: z.string().url('Invalid media URL'),
  mediaPublicId: z.string().optional().default(''),
  mediaOriginalUrl: z.string().url().optional(),
  mediaOptimizedUrl: z.string().url().optional(),
  mediaThumbnailUrl: z.string().url().optional(),
});

export const updateIssueStatusSchema = z.object({
  status: z.enum(['open', 'verified', 'in_progress', 'resolved']),
  note: z.string().optional().default(''),
});

export const getNearbyIssuesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().optional(),
});

export const listIssuesQuerySchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  ward: z.string().optional(),
  severity: z.coerce.number().int().min(1).max(5).optional(),
  reporterId: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  distance: z.coerce.number().positive().optional(),
  cursor: z.string().optional(),
  sort: z.enum(['latest', 'votes', 'priority']).optional().default('priority'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
});
