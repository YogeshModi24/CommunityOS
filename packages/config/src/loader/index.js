"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultResolver = void 0;
exports.loadEnvFiles = loadEnvFiles;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Default resolver reads directly from process.env
const defaultResolver = (key) => process.env[key];
exports.defaultResolver = defaultResolver;
/**
 * Standardized env files loading order based on Next.js/twelve-factor conventions:
 * 1. .env.${NODE_ENV}.local (local overrides, ignored)
 * 2. .env.local (local overrides, ignored, not loaded in test mode)
 * 3. .env.${NODE_ENV} (environment-specific settings)
 * 4. .env (defaults)
 */
function loadEnvFiles(workspaceRoot = process.cwd()) {
    const mode = process.env.NODE_ENV || 'development';
    const envFiles = [
        `.env.${mode}.local`,
        mode !== 'test' ? '.env.local' : null,
        `.env.${mode}`,
        '.env',
    ].filter(Boolean);
    for (const file of envFiles) {
        const filePath = path_1.default.resolve(workspaceRoot, file);
        if (fs_1.default.existsSync(filePath)) {
            // dotenv.config only sets variables that are not already set
            dotenv_1.default.config({ path: filePath });
        }
    }
}
