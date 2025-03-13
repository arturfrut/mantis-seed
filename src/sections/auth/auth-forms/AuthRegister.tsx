'use client';

import { useEffect, useState, SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';

// material-ui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import FirebaseSocial from './FirebaseSocial';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// types
import { StringColorProps } from 'types/password';
import { handleSuccessfulLogin, loginUser, registerUser } from 'utils/trpc-helpers';

export default function AuthRegister({ providers, csrfToken }: any) {
  const [level, setLevel] = useState<StringColorProps>();
  const [showPassword, setShowPassword] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const router = useRouter();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const changePassword = (value: string) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  useEffect(() => {
    changePassword('');
  }, []);

  // Reset status message after 5 seconds
  useEffect(() => {
    if (registrationStatus) {
      const timer = setTimeout(() => {
        setRegistrationStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [registrationStatus]);

  // Activa/desactiva el modo debug con Alt+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'd') {
        setIsDebugMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {registrationStatus && (
        <Alert severity={registrationStatus.success ? 'success' : 'error'} sx={{ mb: 2 }}>
          {registrationStatus.message}
        </Alert>
      )}

      {isDebugMode && debugInfo && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, maxHeight: '200px', overflow: 'auto' }}>
          <Typography variant="subtitle2">Información de depuración:</Typography>
          <pre style={{ fontSize: '0.75rem' }}>{JSON.stringify(debugInfo, null, 2)}</pre>
        </Box>
      )}

      <Formik
        initialValues={{
          firstname: '',
          lastname: '',
          email: '',
          company: '',
          password: '',
          acceptTerms: false,
          submit: null
        }}
        validationSchema={Yup.object().shape({
          firstname: Yup.string().max(255),
          lastname: Yup.string().max(255),
          email: Yup.string().email('Debe ser un email válido').max(255).required('El email es requerido'),
          company: Yup.string().required('El nombre de la empresa es requerido'),
          password: Yup.string()
            .required('La contraseña es requerida')
            .test(
              'no-leading-trailing-whitespace',
              'La contraseña no puede comenzar ni terminar con espacios',
              (value) => value === value?.trim()
            )
            .min(6, 'La contraseña debe tener al menos 6 caracteres'),
          acceptTerms: Yup.boolean().oneOf([true], 'Debes aceptar los términos y condiciones')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting, resetForm }) => {
          try {
            console.log('CLICK - Iniciando registro');
            const trimmedEmail = values.email.trim();

            if (isDebugMode) {
              setDebugInfo({
                action: 'Registro',
                data: {
                  email: trimmedEmail,
                  password: '**********',
                  company_name: values.company
                }
              });
            }

            // 1. Registrar al usuario
            const registerResult = await registerUser({
              email: trimmedEmail,
              password: values.password,
              company_name: values.company
            });

            if (registerResult.success) {
              setRegistrationStatus({
                success: true,
                message: 'Usuario registrado exitosamente. Iniciando sesión...'
              });

              // 2. Iniciar sesión automáticamente
              const loginResult = await loginUser({
                email: trimmedEmail,
                password: values.password
              });

              if (isDebugMode) {
                setDebugInfo((prev: any) => ({
                  ...prev,
                  loginResult: {
                    success: loginResult.success,
                    message: loginResult.message,
                    hasToken: !!loginResult.token
                  }
                }));
              }

              if (loginResult.success && loginResult.token) {
                // 3. Manejar el login exitoso (guardar token, obtener datos del usuario, etc.)
                const authResult = await handleSuccessfulLogin(loginResult.token);

                if (isDebugMode) {
                  setDebugInfo((prev: any) => ({
                    ...prev,
                    authResult: {
                      success: authResult.success,
                      user: authResult.user ? 'Datos de usuario obtenidos' : 'No se obtuvieron datos'
                    }
                  }));
                }

                if (authResult.success) {
                  // 4. Login exitoso - redirigir al dashboard
                  resetForm();
                  setRegistrationStatus({
                    success: true,
                    message: 'Acceso concedido. Redirigiendo al dashboard...'
                  });

                  // Redirigir
                  setTimeout(() => {
                    router.push('/');
                  }, 1500);
                } else {
                  // Error obteniendo datos del usuario
                  setRegistrationStatus({
                    success: false,
                    message: authResult.message || 'Error obteniendo datos del usuario'
                  });

                  // Redirigir al login para que intente manualmente
                  setTimeout(() => {
                    router.push('/login');
                  }, 2000);
                }
              } else {
                // Error en el login automático
                setRegistrationStatus({
                  success: true,
                  message: 'Usuario registrado pero no se pudo iniciar sesión automáticamente. Redirigiendo al login...'
                });

                // Redirigir al login
                setTimeout(() => {
                  router.push('/login');
                }, 2000);
              }
            } else {
              // Error en el registro
              setRegistrationStatus({
                success: false,
                message: registerResult.message || 'Error al registrar el usuario'
              });
              setStatus({ success: false });
              setErrors({ submit: registerResult.message });
            }
          } catch (error: any) {
            console.error('Error en el proceso de registro:', error);

            if (isDebugMode) {
              setDebugInfo((prev: any) => ({
                ...prev,
                error: error.message || 'Error desconocido'
              }));
            }

            setRegistrationStatus({
              success: false,
              message: error.message || 'Error al registrar el usuario'
            });
            setStatus({ success: false });
            setErrors({ submit: error.message });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue, isValid }) => (
          <form noValidate onSubmit={handleSubmit}>
            {isDebugMode && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="caption">Estado de validación: {isValid ? 'Válido' : 'Inválido'}</Typography>
                <Typography variant="caption" display="block" gutterBottom>
                  Errores: {Object.keys(errors).length > 0 ? Object.keys(errors).join(', ') : 'Ninguno'}
                </Typography>
                <Button size="small" onClick={() => console.log('Valores:', values, 'Errores:', errors)}>
                  Log estado
                </Button>
              </Box>
            )}

            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.company && errors.company)}
                    id="company-signup"
                    value={values.company}
                    name="company"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Ingresá el nombre de tu empresa"
                    inputProps={{}}
                  />
                </Stack>
                {touched.company && errors.company && (
                  <FormHelperText error id="helper-text-company-signup">
                    {errors.company}
                  </FormHelperText>
                )}
              </Grid>

              <Grid size={6}>
                <Stack sx={{ gap: 1 }}>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.firstname && errors.firstname)}
                    id="firstname-signup"
                    value={values.firstname}
                    name="firstname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Nombre"
                    inputProps={{}}
                  />
                </Stack>
                {touched.firstname && errors.firstname && (
                  <FormHelperText error id="helper-text-firstname-signup">
                    {errors.firstname}
                  </FormHelperText>
                )}
              </Grid>

              <Grid size={6}>
                <Stack sx={{ gap: 1 }}>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.lastname && errors.lastname)}
                    id="lastname-signup"
                    value={values.lastname}
                    name="lastname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Apellido"
                    inputProps={{}}
                  />
                </Stack>
                {touched.lastname && errors.lastname && (
                  <FormHelperText error id="helper-text-lastname-signup">
                    {errors.lastname}
                  </FormHelperText>
                )}
              </Grid>

              <Grid size={12}>
                <Divider>
                  <Typography variant="subtitle1">Crear cuenta con:</Typography>
                </Divider>
              </Grid>
              <Grid size={12}>
                <Box>
                  <FirebaseSocial />
                </Box>
              </Grid>
              <Grid size={12}>
                <Divider>
                  <Typography variant="subtitle1">o</Typography>
                </Divider>
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Ingresa tu email"
                    inputProps={{}}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="helper-text-email-signup">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-signup"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      changePassword(e.target.value);
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="**********"
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="helper-text-password-signup">
                    {errors.password}
                  </FormHelperText>
                )}
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid>
                      <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                    </Grid>
                    <Grid>
                      <Typography variant="subtitle1" fontSize="0.75rem">
                        {level?.label}
                      </Typography>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>

              <Grid sx={{ mt: -1 }} size={12}>
                <Stack direction="row" alignItems="center">
                  <Checkbox
                    checked={values.acceptTerms}
                    onChange={(e) => setFieldValue('acceptTerms', e.target.checked)}
                    name="acceptTerms"
                  />
                  <Typography variant="body2">Acepto Términos y condiciones</Typography>
                </Stack>
                {touched.acceptTerms && errors.acceptTerms && <FormHelperText error>{errors.acceptTerms}</FormHelperText>}
              </Grid>

              {errors.submit && (
                <Grid size={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid size={12}>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      console.log('Botón clickeado directamente');
                      if (!isSubmitting) {
                        handleSubmit(e as any);
                      }
                    }}
                  >
                    {isSubmitting ? 'Registrando...' : 'Continuar'}
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}
