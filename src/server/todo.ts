import axios from 'axios';
import * as yup from 'yup';
import { publicProcedure, router } from './trpc';

// Definición de tipos que usaremos
type Todo = {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
};

// Helper para extraer el valor real del input
const extractRealInput = (val: any) => {
  if (val !== null && typeof val === 'object' && '0' in val) {
    return val[0];
  }
  return val;
};

export const todoRouter = router({
  // Procedimiento GET para obtener un todo de JSONPlaceholder
  getTodo: publicProcedure
    .input((val) => {
      const realInput = extractRealInput(val);
      console.log('Input original de getTodo:', val);
      console.log('Input extraído de getTodo:', realInput);

      return yup.number().required('El ID del todo es obligatorio').validateSync(realInput);
    })
    .query(async ({ input }) => {
      console.log('Obteniendo todo con ID:', input);

      try {
        const response = await axios.get(`https://jsonplaceholder.typicode.com/todos/${input}`);
        return response.data as Todo;
      } catch (error: any) {
        console.error('Error al obtener todo:', error.message);
        throw new Error(`No se pudo encontrar el todo con ID: ${input}`);
      }
    }),

  // Procedimiento POST para crear un todo en JSONPlaceholder
  createTodo: publicProcedure
    .input((val) => {
      const realInput = extractRealInput(val);
      console.log('Input original de createTodo:', val);
      console.log('Input extraído de createTodo:', realInput);

      return yup
        .object({
          title: yup.string().required('El título es obligatorio'),
          completed: yup.boolean().default(false),
          userId: yup.number().required('El ID de usuario es obligatorio')
        })
        .validateSync(realInput);
    })
    .mutation(async ({ input }) => {
      console.log('Creando todo:', input);

      try {
        const response = await axios.post('https://jsonplaceholder.typicode.com/todos', input);
        return response.data as Todo;
      } catch (error: any) {
        console.error('Error al crear todo:', error.message);
        throw new Error('No se pudo crear el todo');
      }
    })
});
