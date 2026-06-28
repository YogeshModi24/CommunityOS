"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vitest_1 = require("vitest");
function getFilesRecursively(dir) {
    let results = [];
    if (!fs_1.default.existsSync(dir))
        return [];
    const list = fs_1.default.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path_1.default.join(dir, file);
        const stat = fs_1.default.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFilesRecursively(filePath));
        }
        else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            results.push(filePath);
        }
    });
    return results;
}
(0, vitest_1.describe)('Architecture Fitness Guardrails', () => {
    const rootDir = path_1.default.resolve(__dirname, '../../../../');
    const apiSrcDir = path_1.default.join(rootDir, 'apps/api/src');
    (0, vitest_1.it)('should verify controllers contain no Mongoose, Redis, Cloudinary, or BullMQ direct imports', () => {
        const controllersDir = path_1.default.join(apiSrcDir, 'controllers');
        const files = getFilesRecursively(controllersDir);
        files.forEach((file) => {
            const content = fs_1.default.readFileSync(file, 'utf-8');
            (0, vitest_1.expect)(content).not.toContain("from 'mongoose'");
            (0, vitest_1.expect)(content).not.toContain('from "mongoose"');
            (0, vitest_1.expect)(content).not.toContain("from 'ioredis'");
            (0, vitest_1.expect)(content).not.toContain('from "ioredis"');
            (0, vitest_1.expect)(content).not.toContain("from 'cloudinary'");
            (0, vitest_1.expect)(content).not.toContain('from "cloudinary"');
            (0, vitest_1.expect)(content).not.toContain("from 'bullmq'");
            (0, vitest_1.expect)(content).not.toContain('from "bullmq"');
            (0, vitest_1.expect)(content).not.toContain('models/User');
            (0, vitest_1.expect)(content).not.toContain('models/Issue');
        });
    });
    (0, vitest_1.it)('should verify services contain no Express routing or HTTP imports', () => {
        const servicesDir = path_1.default.join(apiSrcDir, 'services');
        const files = getFilesRecursively(servicesDir);
        files.forEach((file) => {
            const content = fs_1.default.readFileSync(file, 'utf-8');
            (0, vitest_1.expect)(content).not.toContain("from 'express'");
            (0, vitest_1.expect)(content).not.toContain('from "express"');
        });
    });
    (0, vitest_1.it)('should verify use cases contain no Express routing or HTTP imports', () => {
        const useCasesDir = path_1.default.join(apiSrcDir, 'use-cases');
        const files = getFilesRecursively(useCasesDir);
        files.forEach((file) => {
            const content = fs_1.default.readFileSync(file, 'utf-8');
            (0, vitest_1.expect)(content).not.toContain("from 'express'");
            (0, vitest_1.expect)(content).not.toContain('from "express"');
        });
    });
    (0, vitest_1.it)('should verify domain layer contains no infrastructure imports', () => {
        const domainDir = path_1.default.join(apiSrcDir, 'domain');
        const files = getFilesRecursively(domainDir);
        files.forEach((file) => {
            const content = fs_1.default.readFileSync(file, 'utf-8');
            (0, vitest_1.expect)(content).not.toContain("from 'mongoose'");
            (0, vitest_1.expect)(content).not.toContain('from "mongoose"');
            (0, vitest_1.expect)(content).not.toContain("from 'ioredis'");
            (0, vitest_1.expect)(content).not.toContain('from "ioredis"');
            (0, vitest_1.expect)(content).not.toContain("from 'bullmq'");
            (0, vitest_1.expect)(content).not.toContain('from "bullmq"');
        });
    });
});
