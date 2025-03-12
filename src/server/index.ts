import { router } from './trpc';
import { authRouter } from './auth';
import { pokemonRouter } from './pokemon';
import { todoRouter } from './todo';

// Creamos el router principal con todos nuestros sub-routers
export const appRouter = router({
  // Añadimos los procedimientos de los diferentes routers
  auth: authRouter,

  // Para los procedimientos individuales, debemos añadirlos explícitamente
  getPokemonByName: pokemonRouter.getPokemonByName,
  getPokemonTypes: pokemonRouter.getPokemonTypes,

  getTodo: todoRouter.getTodo,
  createTodo: todoRouter.createTodo
});

// Exportamos el tipo del router (no el router en sí)
export type AppRouter = typeof appRouter;
