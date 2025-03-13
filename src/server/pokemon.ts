import axios from 'axios';
import * as yup from 'yup';
import { publicProcedure, router } from './trpc';

// Definición de tipos que usaremos
type Pokemon = {
  name: string;
  id: number;
  height: number;
  weight: number;
};

// Helper para extraer el valor real del input
const extractRealInput = (val: any) => {
  if (val !== null && typeof val === 'object' && '0' in val) {
    return val[0];
  }
  return val;
};

export const pokemonRouter = router({
  // Procedimiento para obtener un Pokémon por su nombre (respuesta pequeña)
  getPokemonByName: publicProcedure
    .input((val) => {
      const realInput = extractRealInput(val);

      return yup.string().required('El nombre del Pokémon es obligatorio').validateSync(realInput);
    })
    .query(async ({ input }) => {

      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${input}`);
        const pokemon = response.data;
        // Devolvemos solo algunos campos para mantener la respuesta pequeña
        return {
          name: pokemon.name,
          id: pokemon.id,
          height: pokemon.height,
          weight: pokemon.weight
        } as Pokemon;
      } catch (error: any) {
        console.error('Error al buscar Pokémon:', error.message);
        throw new Error(`No se pudo encontrar el Pokémon: ${input}`);
      }
    }),

  // Procedimiento para obtener la lista de tipos de Pokémon (respuesta pequeña)
  getPokemonTypes: publicProcedure.query(async () => {
    console.log('Obteniendo tipos de Pokémon');

    try {
      const response = await axios.get('https://pokeapi.co/api/v2/type?limit=5');
      return response.data.results.map((type: any) => ({
        name: type.name
      }));
    } catch (error: any) {
      console.error('Error al obtener tipos de Pokémon:', error.message);
      throw new Error('No se pudieron obtener los tipos de Pokémon');
    }
  })
});
