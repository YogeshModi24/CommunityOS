import fs from 'fs';
import path from 'path';

import { ClientSchema, ServerSchema } from '../schemas';

function generateMarkdown() {
  const serverShape = ServerSchema.shape;
  const clientShape = ClientSchema.shape;

  let markdown = `# Environment Variables Reference\n\n`;
  markdown += `This document lists all environment variables supported by **CommunityOS** and validated at startup.\n\n`;

  markdown += `## 1. Server Configuration (API & Worker)\n\n`;
  markdown += `| Variable Name | Required | Default Value | Description |\n`;
  markdown += `| :--- | :--- | :--- | :--- |\n`;

  for (const [key, val] of Object.entries(serverShape)) {
    const value = val as any;
    // Check if the Zod schema is not optional (and doesn't have a default value)
    const hasDefault = value._def && value._def.defaultValue !== undefined;
    const isRequired = !value.isOptional() && !hasDefault;
    const defaultValue = hasDefault ? String(value._def.defaultValue()) : 'N/A';
    const description = value.description || 'No description provided.';
    markdown += `| \`${key}\` | ${isRequired ? '**Yes**' : 'No'} | \`${defaultValue}\` | ${description} |\n`;
  }

  markdown += `\n## 2. Client Configuration (Next.js Application)\n\n`;
  markdown += `| Variable Name | Required | Default Value | Description |\n`;
  markdown += `| :--- | :--- | :--- | :--- |\n`;

  for (const [key, val] of Object.entries(clientShape)) {
    const value = val as any;
    const hasDefault = value._def && value._def.defaultValue !== undefined;
    const isRequired = !value.isOptional() && !hasDefault;
    const defaultValue = hasDefault ? String(value._def.defaultValue()) : 'N/A';
    const description = value.description || 'No description provided.';
    markdown += `| \`${key}\` | ${isRequired ? '**Yes**' : 'No'} | \`${defaultValue}\` | ${description} |\n`;
  }

  const outputPath = path.resolve(__dirname, '../../../../ENVIRONMENT_REFERENCE.md');
  fs.writeFileSync(outputPath, markdown);
  console.log(`Successfully generated ${outputPath}`);
}

generateMarkdown();
