import { NextRequest } from 'next/server';

import { auth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const session = await auth();
  
  if (!session || !(session as any).token) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/ai/${params.path.join('/')}`;
  
  try {
    const body = await req.text();
    
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
        headers.set(key, value);
      }
    });
    headers.set('Authorization', `Bearer ${(session as any).token}`);
    
    // Proxy the request to the backend with the extracted JWT token
    const response = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: body || undefined,
    });
    
    // Return the response directly to stream the SSE chunks back to the client
    return response;
  } catch {
    return new Response('Internal Server Error', { status: 500 });
  }
}
