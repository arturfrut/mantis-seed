import axios from 'axios';
import * as yup from 'yup';
import { authBaseUrl } from '../config';
import { LoginResponse, RegisterResponse, User } from '../types/auth';
import { publicProcedure, router } from './trpc';

// Configuración Axios para incluir tokens en peticiones autenticadas
const getAuthenticatedAxios = (token?: string) => {
  return axios.create({
    baseURL: authBaseUrl,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const authRouter = router({
  // Procedimiento para registrar un nuevo usuario (mantenemos el existente)
  register: publicProcedure
    .input(
      yup.object({
        email: yup.string().email('Debe ser un email válido').required('El email es requerido'),
        password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es requerida'),
        company_name: yup.string().required('El nombre de la empresa es requerido')
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { email, password, company_name } = input;

        console.log('URL completa:', `${authBaseUrl}/api/v2/clients/register-admin-client`);
        console.log('Datos enviados:', {
          company_name,
          company_email: email,
          email,
          password
        });

        // Utilizamos el cliente normal de axios (no tRPC) para conectarnos a la API externa
        const res = await axios.post(`${authBaseUrl}/api/v2/clients/register-admin-client`, {
          company_name,
          company_email: email,
          email,
          company_phone: '1144444444',
          company_address: 'Calle 123',
          user_first_name: 'Admin',
          user_last_name: company_name,
          user_email: email,
          user_password: password
        });

        if (res.data?.ok === 0) {
          return {
            success: false,
            message: res.data.message
          } as RegisterResponse;
        }

        return {
          success: true,
          message: 'Usuario registrado con éxito'
        } as RegisterResponse;
      } catch (error: any) {
        console.error('Error en el registro:', error.response?.data || error.message);

        if (error?.response?.data?.message) {
          return {
            success: false,
            message: error.response.data.message
          } as RegisterResponse;
        }

        const errors: string[] = error?.response?.data?.errors ? Object.values(error.response.data.errors) : ['Ha ocurrido un error'];

        return {
          success: false,
          message: errors[0] || 'Ha ocurrido un error creando el usuario'
        } as RegisterResponse;
      }
    }),

  // Procedimiento para iniciar sesión
  login: publicProcedure
    .input(
      yup.object({
        email: yup.string().email('Debe ser un email válido').required('El email es requerido'),
        password: yup.string().required('La contraseña es requerida')
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { email, password } = input;

        console.log('Intentando iniciar sesión con:', { email });

        // Verifica la URL completa a la que estamos accediendo
        console.log('URL de login completa:', `${authBaseUrl}/v1/auth/login`);

        // Basado en el AuthApi.login que compartiste
        // Ruta relativa si authBaseUrl ya incluye la parte base de la URL
        const res = await axios.post(`${authBaseUrl}/v1/auth/login`, {
          email,
          password
        });

        console.log('Respuesta del login:', res.data);

        if (res.status !== 200) {
          return {
            success: false,
            token: null,
            message: res.data.message || 'Ha ocurrido un error en el inicio de sesión'
          } as LoginResponse;
        }

        // Verificamos si hay un token de acceso
        if (res?.data?.access_token) {
          return {
            success: true,
            token: res.data.access_token,
            message: 'Inicio de sesión exitoso'
          } as LoginResponse;
        }

        return {
          success: false,
          token: null,
          message: 'Ha ocurrido un error obteniendo el token'
        } as LoginResponse;
      } catch (error: any) {
        console.error('Error en el login:', error.response?.data || error.message);

        const errorMessage = error.response?.data?.message || 'Error desconocido en la autenticación';

        return {
          success: false,
          token: null,
          message: errorMessage
        } as LoginResponse;
      }
    }),

  // Procedimiento para obtener la información del usuario actual
  me: publicProcedure.input(yup.string().required('El token es requerido')).query(async ({ input }) => {
    try {
      const token = input;

      console.log('Obteniendo información del usuario con token');

      // Basado en el AuthApi.me que compartiste
      const client = getAuthenticatedAxios(token);
      const res = await client.get('/api/v2/whatsapp/televenta/me');

      if (res.status !== 200) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      return res?.data?.data as User;
    } catch (error: any) {
      console.error('Error obteniendo información del usuario:', error.response?.data || error.message);
      throw new Error('No se pudo obtener la información del usuario');
    }
  })
});
