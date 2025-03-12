import axios from 'axios';
import * as yup from 'yup';
import { authBaseUrl } from '../config';
import { publicProcedure, router } from './trpc';
import { RegisterResponse } from '../types/auth';

// Cliente Axios para la API de autenticación

export const authRouter = router({
  // Procedimiento para registrar un nuevo usuario
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
    })
});
