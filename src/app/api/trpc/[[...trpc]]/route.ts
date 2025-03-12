import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../../../server';

// Creamos un handler para procesar las peticiones tRPC
export async function GET(req: Request) {
  console.log('tRPC GET request received:', req.url);

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
    onError: ({ error }) => {
      console.error('tRPC error:', error);
    }
  });
}

export async function POST(req: Request) {
  console.log('tRPC POST request received:', req.url);

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
    onError: ({ error }) => {
      console.error('tRPC error:', error);
    }
  });
}
