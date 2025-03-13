import { trpc } from 'app/_trpc/client';
import { User } from '../types/auth';

// Función para registrar un usuario
export const registerUser = async (userData: { email: string; password: string; company_name: string }) => {
  try {
    return await trpc.register.mutate(userData);
  } catch (error: any) {
    console.error('Error registrando usuario:', error.message);
    return { success: false, message: error.message };
  }
};

// Función para iniciar sesión
export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    return await trpc.login.mutate(credentials);
  } catch (error: any) {
    console.error('Error en login:', error.message);
    return { success: false, token: null, message: error.message };
  }
};

// Función para obtener datos del usuario
export const getCurrentUser = async (token: string): Promise<User | null> => {
  try {
    return await trpc.me.query(token);
  } catch (error: any) {
    console.error('Error obteniendo datos del usuario:', error.message);
    return null;
  }
};

// Función para gestionar el flujo completo de autenticación después del login
// export const handleSuccessfulLogin = async (token: string) => {
//   try {
//     // Guardar token
//     localStorage.setItem('andoToken', token);
//     localStorage.setItem('auth', 'true');

//     // Intentar obtener datos del usuario
//     let user = null;
//     try {
//       user = await getCurrentUser(token);
//     } catch (userError) {
//       console.warn('No se pudo obtener información del usuario, continuando con valores predeterminados', userError);
//     }

//     if (user) {
//       // Si tenemos usuario, validar rol y guardar datos
//       if (![1, 2].includes(user.rol_id)) {
//         // Rol inválido - desconectar
//         localStorage.setItem('auth', 'false');
//         throw new Error('No tienes el rol necesario para poder ingresar al panel admin');
//       }

//       // Guardar información del usuario en localStorage
//       localStorage.setItem('user_email', user.email);
//       if (user.external_client !== undefined) localStorage.setItem('user_external_client', String(user.external_client));
//       localStorage.setItem('user_name', user.name);
//       localStorage.setItem('user_rol_id', String(user.rol_id));
//       localStorage.setItem('user_company_id', String(user.company_id));

//       if (user.phone_id_alias) localStorage.setItem('user_phone_id_alias', user.phone_id_alias);
//       if (user.meli_user_id) localStorage.setItem('meli_user_id', user.meli_user_id);
//     } else {
//       // Si no tenemos datos del usuario, usar valores predeterminados
//       localStorage.setItem('user_email', '');
//       localStorage.setItem('user_rol_id', '1'); // Rol predeterminado
//       localStorage.setItem('user_company_id', '1'); // ID de compañía predeterminado
//     }

//     localStorage.setItem('greeting', 'true');

//     return {
//       success: true,
//       user: user || { id: 1, name: '', email: '', rol_id: 1, company_id: 1 }
//     };
//   } catch (error: any) {
//     console.error('Error en el proceso de login:', error.message);
//     // Limpiar localStorage en caso de error
//     localStorage.removeItem('andoToken');
//     localStorage.setItem('auth', 'false');
//     return { success: false, message: error.message };
//   }
// };
export const handleSuccessfulLogin = async (token: string) => {
  try {
    // Guardar token
    localStorage.setItem('andoToken', token);
    localStorage.setItem('auth', 'true');

    // No intentamos obtener datos del usuario, simplemente usamos valores predeterminados

    // Guardar información básica en localStorage
    localStorage.setItem('user_email', '');
    localStorage.setItem('user_rol_id', '1'); // Rol predeterminado
    localStorage.setItem('user_company_id', '1'); // ID de compañía predeterminado
    localStorage.setItem('greeting', 'true');

    // Retornar éxito con datos de usuario genéricos
    return {
      success: true,
      user: { id: 1, name: '', email: '', rol_id: 1, company_id: 1 }
    };
  } catch (error: any) {
    console.error('Error en el proceso de login:', error.message);
    // Limpiar localStorage en caso de error
    localStorage.removeItem('andoToken');
    localStorage.setItem('auth', 'false');
    return { success: false, message: error.message };
  }
};
