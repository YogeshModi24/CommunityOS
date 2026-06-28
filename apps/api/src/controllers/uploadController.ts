import { ValidationError } from '@community-os/errors';
import { NextFunction, Response } from 'express';

import { container } from '../infra/container';
import { AuthRequest } from '../middleware/auth';
import { IUploadService } from '../services/contracts/IUploadService';

export async function uploadImageHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded (use multipart field: "file")');
    }
    const uploadService = container.resolve<IUploadService>('uploadService');
    const result = await uploadService.uploadImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    if (result.isFailure) {
      throw new ValidationError(result.error);
    }

    res.status(201).json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}
