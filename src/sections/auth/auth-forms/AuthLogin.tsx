'use client';

import React, { useState, FocusEvent, SyntheticEvent } from 'react';

// next
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

// material-ui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import FirebaseSocial from './FirebaseSocial';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import { handleSuccessfulLogin, loginUser } from 'utils/trpc-helpers';

export default function AuthLogin({ providers, csrfToken }: any) {
  const [capsWarning, setCapsWarning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);

  const router = useRouter();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const onKeyDown = (keyEvent: any) => {
    if (keyEvent.getModifierState('CapsLock')) {
      setCapsWarning(true);
    } else {
      setCapsWarning(false);
    }
  };

  // Activar modo debug con Alt+D
  React.useEffect(() => {
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
      {loginStatus && (
        <Alert severity={loginStatus.success ? 'success' : 'error'} sx={{ mb: 2 }}>
          {loginStatus.message}
        </Alert>
      )}

      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Debe ser un email válido').max(255).required('Su email es requerido'),
          password: Yup.string()
            .required('Su contraseña es requerida')
            .test('no-leading-trailing-whitespace', 'La contraseña no puede tener espacios vacios', (value) => value === value?.trim())
        })}
        onSubmit={async (values, { setErrors, setSubmitting }) => {
          try {
            console.log('Iniciando proceso de login');
            const trimmedEmail = values.email.trim();

            // 1. Llamar al procedimiento login de tRPC
            const loginResult = await loginUser({
              email: trimmedEmail,
              password: values.password
            });

            if (isDebugMode) {
              console.log('Resultado del login:', loginResult);
            }

            if (loginResult.success && loginResult.token) {
              setLoginStatus({
                success: true,
                message: 'Iniciando sesión...'
              });

              // 2. Manejar el login exitoso
              const authResult = await handleSuccessfulLogin(loginResult.token);

              if (authResult.success) {
                // 3. Login exitoso - redirigir al dashboard
                setLoginStatus({
                  success: true,
                  message: 'Acceso concedido. Redirigiendo al dashboard...'
                });

                // Redirigir
                setTimeout(() => {
                  router.push('/');
                }, 1000);
              } else {
                // Error obteniendo datos del usuario
                setLoginStatus({
                  success: false,
                  message: authResult.message || 'Error obteniendo datos del usuario'
                });
                setErrors({ submit: authResult.message || 'Error obteniendo datos del usuario' });
              }
            } else {
              // Error en el login
              setLoginStatus({
                success: false,
                message: loginResult.message || 'Error al iniciar sesión'
              });
              setErrors({ submit: loginResult.message || 'Error al iniciar sesión' });
            }
          } catch (error: any) {
            console.error('Error en proceso de login:', error);
            setLoginStatus({
              success: false,
              message: error.message || 'Error al iniciar sesión'
            });
            setErrors({ submit: error.message || 'Error al iniciar sesión' });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, isValid }) => (
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
                  <InputLabel htmlFor="email-login">Mail</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="nombre@empresa.com"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="password-login">Contraseña</InputLabel>
                  <OutlinedInput
                    fullWidth
                    color={capsWarning ? 'warning' : 'primary'}
                    error={Boolean(touched.password && errors.password)}
                    id="password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={(event: FocusEvent<any, Element>) => {
                      setCapsWarning(false);
                      handleBlur(event);
                    }}
                    onKeyDown={onKeyDown}
                    onChange={handleChange}
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
                    placeholder="********"
                  />
                  {capsWarning && (
                    <Typography variant="caption" sx={{ color: 'warning.main' }} id="warning-helper-text-password-login">
                      Bloc Mayus Activado
                    </Typography>
                  )}
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-login">
                    {errors.password}
                  </FormHelperText>
                )}
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
                      console.log('Botón login clickeado');
                      if (!isSubmitting) {
                        handleSubmit(e as any);
                        console.log('El formulario de login no se pudo enviar - Validación:', isValid, 'Errores:', errors);
                      }
                    }}
                  >
                    {isSubmitting ? 'Iniciando sesión...' : 'Continuar'}
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'baseline', justifyContent: 'space-between', mt: 4 }}>
        <Link variant="h6" component={NextLink} href="/forget-pass" color="text.primary">
          Olvidé mi contraseña
        </Link>
      </Stack>
      <Grid size={12}>
        <Divider sx={{ my: 2.5 }}>
          <Typography variant="subtitle1">Iniciar Sesión con:</Typography>
        </Divider>
      </Grid>
      <Box sx={{ mt: 3 }}>
        <FirebaseSocial />
      </Box>
    </>
  );
}
