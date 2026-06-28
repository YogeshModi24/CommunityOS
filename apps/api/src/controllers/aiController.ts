import { Request, Response } from 'express';

import { container } from '../infra/container';
import { logger } from '../lib/logger';
import { IAIService } from '../services/contracts/IAIService';

export async function citizenAssistantStream(req: Request, res: Response) {
  try {
    const aiService = container.resolve<IAIService>('aiService');
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    const systemPrompt = `You are the CommunityOS Citizen Assistant.
Your goal is to help citizens report civic issues (like potholes, water leaks, garbage dumps, broken streetlights) effectively.
Ask clarifying questions to ensure they provide a clear description and good photos.
Keep your responses concise, helpful, and friendly. Do not use markdown headers, just simple text.`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = aiService.chatStream(messages, systemPrompt);

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
    return;
  } catch (err: any) {
    logger.error(`[AIController] Citizen assistant stream error: ${err.message}`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process AI request' });
    } else {
      res.end();
    }
    return;
  }
}
