import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

describe('Architecture Fitness Guardrails', () => {
  const rootDir = path.resolve(__dirname, '../../../../');
  const apiSrcDir = path.join(rootDir, 'apps/api/src');

  it('should verify controllers contain no Mongoose, Redis, Cloudinary, or BullMQ direct imports', () => {
    const controllersDir = path.join(apiSrcDir, 'controllers');
    const files = getFilesRecursively(controllersDir);
    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');

      expect(content).not.toContain("from 'mongoose'");
      expect(content).not.toContain('from "mongoose"');
      expect(content).not.toContain("from 'ioredis'");
      expect(content).not.toContain('from "ioredis"');
      expect(content).not.toContain("from 'cloudinary'");
      expect(content).not.toContain('from "cloudinary"');
      expect(content).not.toContain("from 'bullmq'");
      expect(content).not.toContain('from "bullmq"');
      expect(content).not.toContain('models/User');
      expect(content).not.toContain('models/Issue');
    });
  });

  it('should verify services contain no Express routing or HTTP imports', () => {
    const servicesDir = path.join(apiSrcDir, 'services');
    const files = getFilesRecursively(servicesDir);
    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');

      expect(content).not.toContain("from 'express'");
      expect(content).not.toContain('from "express"');
    });
  });

  it('should verify use cases contain no Express routing or HTTP imports', () => {
    const useCasesDir = path.join(apiSrcDir, 'use-cases');
    const files = getFilesRecursively(useCasesDir);
    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');

      expect(content).not.toContain("from 'express'");
      expect(content).not.toContain('from "express"');
    });
  });

  it('should verify domain layer contains no infrastructure imports', () => {
    const domainDir = path.join(apiSrcDir, 'domain');
    const files = getFilesRecursively(domainDir);
    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');

      expect(content).not.toContain("from 'mongoose'");
      expect(content).not.toContain('from "mongoose"');
      expect(content).not.toContain("from 'ioredis'");
      expect(content).not.toContain('from "ioredis"');
      expect(content).not.toContain("from 'bullmq'");
      expect(content).not.toContain('from "bullmq"');
    });
  });
});
