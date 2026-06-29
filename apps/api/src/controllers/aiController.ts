import { Request, Response } from 'express';

import { runCopilotAgent } from '../ai/agents/copilot.agent';
import { container } from '../infra/container';
import { logger } from '../lib/logger';
import { IAIService } from '../services/contracts/IAIService';

export async function citizenAssistantStream(req: Request, res: Response) {
  const requestId = Math.random().toString(36).substring(7);
  const userId = (req as any).user?.id || 'anonymous';
  const startTime = Date.now();
  
  logger.info(`[AIController] Starting Citizen Assistant stream`, { requestId, userId, endpoint: '/api/ai/assistant/citizen' });

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
    
    const duration = Date.now() - startTime;
    logger.info(`[AIController] Finished Citizen Assistant stream`, { requestId, userId, durationMs: duration, success: true });
    return;
  } catch (err: any) {
    const duration = Date.now() - startTime;
    logger.error(`[AIController] Citizen assistant stream error: ${err.message}`, { requestId, userId, durationMs: duration, success: false, error: err });
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process AI request' });
    } else {
      res.end();
    }
    return;
  }
}

export async function copilotStream(req: Request, res: Response) {
  const requestId = Math.random().toString(36).substring(7);
  const userId = (req as any).user?.id || 'anonymous';
  const startTime = Date.now();

  logger.info(`[AIController] Starting Municipality Copilot stream`, { requestId, userId, endpoint: '/api/ai/assistant/copilot', provider: 'openai', model: 'gpt-4o' });

  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = runCopilotAgent(messages);

    let toolsInvoked = 0;
    
    for await (const chunk of stream) {
      // Basic heuristic to count tools logged internally vs chunks yielded
      if (chunk.includes('Error executing tool') || chunk.includes('I am currently running in mock mode')) {
        toolsInvoked++;
      }
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
    
    const duration = Date.now() - startTime;
    logger.info(`[AIController] Finished Municipality Copilot stream`, { requestId, userId, durationMs: duration, success: true, toolsInvoked });
    
    return;
  } catch (err: any) {
    const duration = Date.now() - startTime;
    logger.error(`[AIController] Copilot stream error: ${err.message}`, { requestId, userId, durationMs: duration, success: false, error: err });
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process Copilot request' });
    } else {
      res.end();
    }
    return;
  }
}
