import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';

import { logger } from '../../lib/logger';
import { MunicipalitySystemPrompt } from '../prompts/municipality.system';
import { ToolRegistry } from '../registry/ToolRegistry';

export async function* runCopilotAgent(
  messages: { role: string; content: string }[],
): AsyncGenerator<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'mock' || apiKey.startsWith('change_me')) {
    yield 'I am currently running in mock mode and cannot access live tools. Please configure an OpenAI API key.';
    return;
  }

  const model = new ChatOpenAI({
    model: 'gpt-4o',
    temperature: 0,
    streaming: true,
  });

  const modelWithTools = model.bindTools(ToolRegistry as any);

  const lcMessages: any[] = [new SystemMessage(MunicipalitySystemPrompt)];
  
  for (const msg of messages) {
    if (msg.role === 'user') {
      lcMessages.push(new HumanMessage(msg.content));
    } else if (msg.role === 'assistant') {
      lcMessages.push(new AIMessage(msg.content));
    }
  }

  let numCalls = 0;
  const maxCalls = 5;

  while (numCalls < maxCalls) {
    numCalls++;
    const response = await modelWithTools.invoke(lcMessages);
    lcMessages.push(response);

    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const toolCall of response.tool_calls) {
        logger.info(`[CopilotAgent] Executing tool: ${toolCall.name}`, {
          tool: toolCall.name,
          args: toolCall.args,
        });

        const tool = ToolRegistry.find(t => t.name === toolCall.name);
        
        let toolResult = '';
        if (tool) {
          try {
            const startTime = Date.now();
            toolResult = await tool.invoke(toolCall.args);
            const duration = Date.now() - startTime;
            logger.info(`[CopilotAgent] Tool execution succeeded: ${toolCall.name}`, { durationMs: duration });
          } catch (err: any) {
            logger.error(`[CopilotAgent] Tool execution failed: ${toolCall.name}`, err);
            toolResult = `Error executing tool: ${err.message}`;
          }
        } else {
          toolResult = `Tool ${toolCall.name} not found.`;
        }

        lcMessages.push(
          new ToolMessage({
            tool_call_id: toolCall.id!,
            content: toolResult,
          })
        );
      }
    } else {
      // Stream the final response
      // Remove the last 'invoke' response and use stream instead
      lcMessages.pop();
      const stream = await modelWithTools.stream(lcMessages);
      for await (const chunk of stream) {
        if (chunk.content) {
          yield chunk.content.toString();
        }
      }
      break;
    }
  }
}
