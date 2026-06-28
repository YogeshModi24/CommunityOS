import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

import { logger } from '../../lib/logger';
import { AIAnalysisResponse, IAIProvider } from '../contracts/IAIProvider';

const AnalysisSchema = z.object({
  category: z.enum([
    'pothole',
    'water_leak',
    'streetlight',
    'garbage',
    'encroachment',
    'sewage',
    'other',
  ]),
  severity: z.number().int().min(1).max(5),
  description: z.string().max(80),
  hazardous: z.boolean(),
  confidence: z.number().min(0).max(1),
  department: z.enum([
    'roads',
    'water_and_sanitation',
    'electrical',
    'waste_management',
    'public_works',
    'other',
  ]),
  estimated_sla_days: z.number().int().min(1).max(30),
});

export class OpenAIProvider implements IAIProvider {
  private structuredModel: any = null;
  private readonly MODEL_NAME = 'gpt-4o';
  private readonly PROMPT_VERSION = 'v1';
  private readonly AI_VERSION = 'v1';

  private getStructuredModel() {
    if (!this.structuredModel) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey === 'mock' || apiKey.startsWith('change_me')) {
        return null;
      }
      const model = new ChatOpenAI({ model: this.MODEL_NAME, temperature: 0 });
      this.structuredModel = model.withStructuredOutput(AnalysisSchema);
    }
    return this.structuredModel;
  }

  async analyzeImage(imageUrl: string): Promise<AIAnalysisResponse> {
    const model = this.getStructuredModel();

    if (!model) {
      // Mock analyzer logic
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let category = 'pothole';
      let description = 'Deep pothole detected in the center of the road, causing safety hazards.';
      let severity = 4;
      let hazardous = true;
      let department = 'roads';
      let estimated_sla_days = 7;

      const lowerUrl = imageUrl.toLowerCase();
      if (
        lowerUrl.includes('garbage') ||
        lowerUrl.includes('trash') ||
        lowerUrl.includes('waste')
      ) {
        category = 'garbage';
        description = 'Large pile of uncollected garbage blocking the sidewalk, attracting pests.';
        severity = 3;
        hazardous = false;
        department = 'waste_management';
        estimated_sla_days = 2;
      } else if (
        lowerUrl.includes('water') ||
        lowerUrl.includes('leak') ||
        lowerUrl.includes('pipe')
      ) {
        category = 'water_leak';
        description = 'Major drinking water pipe leak causing flooding on the road.';
        severity = 3;
        hazardous = false;
        department = 'water_and_sanitation';
        estimated_sla_days = 1;
      } else if (
        lowerUrl.includes('light') ||
        lowerUrl.includes('lamp') ||
        lowerUrl.includes('dark')
      ) {
        category = 'streetlight';
        description = 'Streetlight is non-functional, leaving the street completely dark at night.';
        severity = 2;
        hazardous = false;
        department = 'electrical';
        estimated_sla_days = 5;
      } else if (
        lowerUrl.includes('sewage') ||
        lowerUrl.includes('drain') ||
        lowerUrl.includes('overflow')
      ) {
        category = 'sewage';
        description = 'Overflowing open sewer line spreading toxic water and odor on the street.';
        severity = 5;
        hazardous = true;
        department = 'water_and_sanitation';
        estimated_sla_days = 1;
      } else if (
        lowerUrl.includes('encroach') ||
        lowerUrl.includes('shop') ||
        lowerUrl.includes('vendor')
      ) {
        category = 'encroachment';
        description =
          'Illegal shop extension occupying half of the public lane, causing congestion.';
        severity = 3;
        hazardous = false;
        department = 'public_works';
        estimated_sla_days = 14;
      }

      return {
        category,
        severity,
        description,
        hazardous,
        confidence: 0.95,
        department,
        estimated_sla_days,
        aiVersion: this.AI_VERSION,
        modelName: 'mock-vision',
        promptVersion: this.PROMPT_VERSION,
        processedAt: new Date(),
      };
    }

    try {
      const response = await model.invoke([
        new HumanMessage({
          content: [
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
            {
              type: 'text',
              text: `You are a civic infrastructure analyst for Indian cities. Analyze this image and classify the civic issue shown.
Category: pothole | water_leak | streetlight | garbage | encroachment | sewage | other
Severity: 1=minor cosmetic, 2=moderate inconvenience, 3=significant disruption, 4=serious safety risk, 5=immediate danger to life
Description: one clear sentence, max 80 characters
Hazardous: true if there is immediate risk to life or property
Confidence: 0.0–1.0 how confident you are in your analysis
Department: classify into the responsible department (roads | water_and_sanitation | electrical | waste_management | public_works | other)
Estimated SLA Days: estimate how many days it should reasonably take to resolve this issue (1-30) based on Indian municipality standards`,
            },
          ],
        }),
      ]);

      return {
        category: response.category,
        severity: response.severity,
        description: response.description,
        hazardous: response.hazardous,
        confidence: response.confidence,
        department: response.department,
        estimated_sla_days: response.estimated_sla_days,
        aiVersion: this.AI_VERSION,
        modelName: this.MODEL_NAME,
        promptVersion: this.PROMPT_VERSION,
        processedAt: new Date(),
      };
    } catch (err: any) {
      logger.error(
        `[OpenAIProvider] OpenAI API vision call failed (${err.message}). Falling back to mock.`,
        err
      );
      return {
        category: 'pothole',
        severity: 4,
        description: 'Pothole detected on the street.',
        hazardous: false,
        confidence: 0.5,
        department: 'roads',
        estimated_sla_days: 7,
        aiVersion: this.AI_VERSION,
        modelName: this.MODEL_NAME,
        promptVersion: this.PROMPT_VERSION,
        processedAt: new Date(),
      };
    }
  }

  async *chatStream(
    messages: { role: string; content: string }[],
    systemPrompt: string
  ): AsyncGenerator<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'mock' || apiKey.startsWith('change_me')) {
      // Mock stream
      const chunks = [
        'Hello! ',
        'I am the ',
        'Citizen Assistant. ',
        'I am currently ',
        'running in mock mode, ',
        'but I am here to help ',
        'you report civic issues ',
        'effectively.',
      ];
      for (const chunk of chunks) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        yield chunk;
      }
      return;
    }

    const model = new ChatOpenAI({ model: this.MODEL_NAME, temperature: 0.7 });
    
    // Map generic messages to LangChain messages
    const formattedMessages: any[] = [{ role: 'system', content: systemPrompt }];
    for (const msg of messages) {
      formattedMessages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
    }

    const stream = await model.stream(formattedMessages);
    for await (const chunk of stream) {
      if (chunk.content) {
        yield chunk.content.toString();
      }
    }
  }
}
