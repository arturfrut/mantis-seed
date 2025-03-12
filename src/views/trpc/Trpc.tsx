'use client';

import { trpc } from 'app/_trpc/client';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

// Funciones específicas para cada procedimiento de tRPC
const fetchPokemonByName = async (name: string) => {
  try {
    return await trpc.getPokemonByName.query(name);
  } catch (error: any) {
    console.error('Error fetching pokemon:', error.message);
    // Devolvemos un objeto de error en lugar de lanzar una excepción
    // para que SWR pueda manejarlo adecuadamente
    return { error: error.message };
  }
};

const fetchPokemonTypes = async () => {
  try {
    return await trpc.getPokemonTypes.query();
  } catch (error: any) {
    console.error('Error fetching pokemon types:', error.message);
    return { error: error.message };
  }
};

const fetchTodo = async (id: number) => {
  try {
    return await trpc.getTodo.query(id);
  } catch (error: any) {
    console.error('Error fetching todo:', error.message);
    return { error: error.message };
  }
};

export default function Trpc() {
  const { mutate } = useSWRConfig();
  const [pokemonName, setPokemonName] = useState('pikachu');
  const [todoId, setTodoId] = useState(1);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [createdTodo, setCreatedTodo] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Queries con SWR usando funciones específicas
  const { data: pokemon, isLoading: pokemonLoading } = useSWR(['pokemon', pokemonName], () => fetchPokemonByName(pokemonName), {
    shouldRetryOnError: false, // Desactivar reintentos en caso de error
    revalidateOnFocus: false // No revalidar al enfocar la ventana
  });

  const { data: types, isLoading: typesLoading } = useSWR('pokemonTypes', fetchPokemonTypes, {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  });

  const { data: todo, isLoading: todoLoading } = useSWR(['todo', todoId], () => fetchTodo(todoId), {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  });

  // Handler para crear un nuevo todo
  const handleCreateTodo = async () => {
    try {
      setIsCreating(true);
      setError(null);

      const data = await trpc.createTodo.mutate({
        title: newTodoTitle,
        userId: 1,
        completed: false
      });

      setCreatedTodo(data);
      setNewTodoTitle('');

      // Revalidar las queries de todos
      mutate(['todo', todoId]);
    } catch (err: any) {
      setError(err.message || 'Error al crear el todo');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">tRPC Next.js 15 con SWR Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sección de Pokémon */}
        <div className="border p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-3">Pokémon API</h2>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Buscar Pokémon por nombre</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={pokemonName}
                onChange={(e) => setPokemonName(e.target.value)}
                className="border p-2 rounded"
                placeholder="Nombre del Pokémon"
              />
            </div>

            {pokemonLoading && <p>Cargando...</p>}
            {pokemon && 'error' in pokemon && <p className="text-red-500">Error: {pokemon.error}</p>}
            {pokemon && !('error' in pokemon) && (
              <div className="bg-gray-100 p-3 rounded">
                <p>
                  <strong>Nombre:</strong> {pokemon.name}
                </p>
                <p>
                  <strong>ID:</strong> {pokemon.id}
                </p>
                <p>
                  <strong>Altura:</strong> {pokemon.height}
                </p>
                <p>
                  <strong>Peso:</strong> {pokemon.weight}
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Tipos de Pokémon (primeros 5)</h3>
            {typesLoading && <p>Cargando tipos...</p>}
            {types && 'error' in types && <p className="text-red-500">Error: {types.error}</p>}
            {types && !('error' in types) && (
              <ul className="list-disc pl-5">
                {types.map((type: { name: string }) => (
                  <li key={type.name}>{type.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sección de JSONPlaceholder */}
        <div className="border p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-3">JSONPlaceholder API</h2>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Obtener Todo por ID</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                value={todoId}
                onChange={(e) => setTodoId(parseInt(e.target.value))}
                className="border p-2 rounded"
                min="1"
                max="200"
              />
            </div>

            {todoLoading && <p>Cargando todo...</p>}
            {todo && 'error' in todo && <p className="text-red-500">Error: {todo.error}</p>}
            {todo && !('error' in todo) && (
              <div className="bg-gray-100 p-3 rounded">
                <p>
                  <strong>ID:</strong> {todo.id}
                </p>
                <p>
                  <strong>Título:</strong> {todo.title}
                </p>
                <p>
                  <strong>Completado:</strong> {todo.completed ? 'Sí' : 'No'}
                </p>
                <p>
                  <strong>Usuario ID:</strong> {todo.userId}
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Crear nuevo Todo</h3>
            <div className="flex flex-col gap-2 mb-2">
              <input
                type="text"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                className="border p-2 rounded"
                placeholder="Título del Todo"
              />
              <button
                onClick={handleCreateTodo}
                disabled={isCreating}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isCreating ? 'Creando...' : 'Crear Todo'}
              </button>
            </div>

            {error && <p className="text-red-500">Error: {error}</p>}

            {createdTodo && (
              <div className="bg-green-100 p-3 rounded">
                <p className="font-medium">Todo creado correctamente:</p>
                <p>
                  <strong>ID:</strong> {createdTodo.id}
                </p>
                <p>
                  <strong>Título:</strong> {createdTodo.title}
                </p>
                <p>
                  <strong>Completado:</strong> {createdTodo.completed ? 'Sí' : 'No'}
                </p>
                <p>
                  <strong>Usuario ID:</strong> {createdTodo.userId}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
