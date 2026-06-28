import { z } from 'zod';

import { ClientSchema, ServerSchema, SharedSchema } from '../schemas';
export type SharedConfig = Readonly<z.infer<typeof SharedSchema>>;
export type ServerConfig = Readonly<z.infer<typeof ServerSchema>>;
export type ClientConfig = Readonly<z.infer<typeof ClientSchema>>;
export type SecretResolver = (key: string) => string | undefined;
//# sourceMappingURL=index.d.ts.map