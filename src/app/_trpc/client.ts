import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppRouter } from '../../server';

// Usamos httpLink en lugar de httpBatchLink para evitar problemas con el batching
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8081'}/api/trpc`
    })
  ]
});
