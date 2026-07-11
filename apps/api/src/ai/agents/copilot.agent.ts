import Groq from 'groq-sdk';

import { logger } from '../../lib/logger';
import { MunicipalitySystemPrompt } from '../prompts/municipality.system';
import { ToolRegistry } from '../registry/ToolRegistry';

// Zod schema to JSON schema helper for Groq tools
function zodToJsonSchema(schema: any): any {
  if (!schema || !schema.shape) {
    return { type: 'object', properties: {} };
  }
  const properties: any = {};
  const required: string[] = [];

  for (const [key, prop] of Object.entries(schema.shape)) {
    let currentProp: any = prop;
    let isOptional = false;

    while (currentProp && currentProp._def) {
      const typeName = currentProp._def.typeName;
      if (typeName === 'ZodOptional') {
        isOptional = true;
        currentProp = currentProp._def.innerType;
      } else if (typeName === 'ZodDefault') {
        isOptional = true;
        currentProp = currentProp._def.innerType;
      } else {
        break;
      }
    }

    const typeDef = currentProp?._def;
    if (!typeDef) continue;

    const propSchema: any = {};
    if (currentProp.description) {
      propSchema.description = currentProp.description;
    } else if (typeDef.description) {
      propSchema.description = typeDef.description;
    }

    switch (typeDef.typeName) {
      case 'ZodString':
        propSchema.type = 'string';
        break;
      case 'ZodNumber':
        propSchema.type = 'number';
        break;
      case 'ZodBoolean':
        propSchema.type = 'boolean';
        break;
      case 'ZodEnum':
        propSchema.type = 'string';
        propSchema.enum = typeDef.values;
        break;
      default:
        propSchema.type = 'string';
    }

    properties[key] = propSchema;
    if (!isOptional) {
      required.push(key);
    }
  }

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
  };
}

export async function* runCopilotAgent(
  messages: { role: string; content: string }[]
): AsyncGenerator<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'mock' || apiKey.startsWith('change_me')) {
    yield 'I am currently running in mock mode and cannot access live tools. Please configure a Groq API key.';
    return;
  }

  const groq = new Groq({ apiKey });
  const model = 'llama-3.3-70b-versatile';

  // Formulate messages list
  const apiMessages: any[] = [{ role: 'system', content: MunicipalitySystemPrompt }];

  for (const msg of messages) {
    apiMessages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  }

  const formattedTools = ToolRegistry.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.schema),
    },
  }));

  let numCalls = 0;
  const maxCalls = 5;

  while (numCalls < maxCalls) {
    numCalls++;

    // Call the LLM to get next step (either final response or tool call)
    const response = await groq.chat.completions.create({
      model,
      messages: apiMessages,
      tools: formattedTools,
      tool_choice: 'auto',
      temperature: 0,
    });

    const choice = response.choices[0];
    if (!choice) {
      break;
    }

    const responseMsg = choice.message;

    // Push the assistant message to history
    apiMessages.push({
      role: 'assistant',
      content: responseMsg.content || null,
      tool_calls: responseMsg.tool_calls || undefined,
    });

    if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
      for (const toolCall of responseMsg.tool_calls) {
        logger.info(`[CopilotAgent] Executing tool: ${toolCall.function.name}`, {
          tool: toolCall.function.name,
          args: toolCall.function.arguments,
        });

        const tool = ToolRegistry.find((t) => t.name === toolCall.function.name);

        let toolResult = '';
        if (tool) {
          try {
            const args = JSON.parse(toolCall.function.arguments || '{}');
            const startTime = Date.now();
            toolResult = await tool.invoke(args);
            const duration = Date.now() - startTime;
            logger.info(`[CopilotAgent] Tool execution succeeded: ${toolCall.function.name}`, {
              durationMs: duration,
            });
          } catch (err: any) {
            logger.error(`[CopilotAgent] Tool execution failed: ${toolCall.function.name}`, err);
            toolResult = `Error executing tool: ${err.message}`;
          }
        } else {
          toolResult = `Tool ${toolCall.function.name} not found.`;
        }

        // Push tool response to history
        apiMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: toolResult,
        });
      }
    } else {
      // No tool calls, stream the final response
      apiMessages.pop();

      const stream = await groq.chat.completions.create({
        model,
        messages: apiMessages,
        stream: true,
        temperature: 0,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
      break;
    }
  }
}
