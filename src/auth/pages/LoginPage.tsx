import ReCAPTCHA from 'react-google-recaptcha'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { useState } from 'react'

const GOOGLE_RECAPTCHA_KEY = import.meta.env.VITE_GOOGLE_RECAPTCHA_KEY ?? ''

interface FormState {
  username: string
  password: string
  capValue: string
}
const defaultValues: FormState = {
  username: '',
  password: '',
  capValue: '',
}

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues })

  const onSubmit = async ({ username, password }: FormState) => {
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/letters')
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = (name: keyof FormState) => {
    return (
      errors[name] && (
        <small id={`${name}-error`} className="p-error">
          Este campo es requerido.
        </small>
      )
    )
  }

  return (
    <main className="w-full h-screen flex">
      <h1 className="absolute top-5 left-5 text-xl font-bold">Discount Pro</h1>
      <div className="w-full h-full flex items-center">
        <div className="max-w-md w-full mx-auto">
          <h3 className="text-2xl font-bold">¡Bienvenido a Discount Pro!</h3>
          <p className="mt-1">Ingresa tus datos para iniciar sesión.</p>
          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="text-sm">
                Usuario
              </label>
              <Controller
                control={control}
                name="username"
                rules={{ required: 'Este campo es requerido.' }}
                render={({ field, fieldState }) => (
                  <InputText
                    id={field.name}
                    {...field}
                    aria-errormessage="username-error"
                    invalid={fieldState.invalid}
                  />
                )}
              />
              {getErrorMessage('username')}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm">
                Contraseña
              </label>
              <Controller
                control={control}
                name="password"
                rules={{ required: 'Este campo es requerido.' }}
                render={({ field, fieldState }) => (
                  <Password
                    id="password"
                    {...field}
                    toggleMask
                    feedback={false}
                    inputClassName="w-full"
                    className="*:w-full"
                    aria-errormessage="password-error"
                    invalid={fieldState.invalid}
                  />
                )}
              />

              {getErrorMessage('password')}
            </div>

            <div className="flex flex-col gap-1">
              <Controller
                control={control}
                name="capValue"
                rules={{ required: 'Este campo es requerido.' }}
                render={({ field }) => (
                  <ReCAPTCHA
                    {...field}
                    aria-errormessage="captcha-error"
                    sitekey={GOOGLE_RECAPTCHA_KEY}
                  />
                )}
              />

              {getErrorMessage('capValue')}
            </div>

            <Button className="justify-center" loading={loading}>
              Iniciar sesión
            </Button>

            <div className="flex justify-center gap-1 text-sm">
              <span>¿No tienes una cuenta?</span>
              <Link to="/sign-up" className="text-indigo-500">
                Regístrate aquí
              </Link>
            </div>

            {error && (
              <small className="text-xs p-error text-center">{error}</small>
            )}
          </form>
        </div>
      </div>
      <div className="w-full h-full">
        <img
          className="w-full h-full object-cover scale-y-100 -scale-x-100 object-left"
          src="https://images.unsplash.com/photo-1564939558297-fc396f18e5c7?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          role=""
          fetchPriority="high"
        />
      </div>
    </main>
  )
}

export default LoginPage
