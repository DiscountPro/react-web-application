import { InputText } from 'primereact/inputtext'
import { Controller, useForm } from 'react-hook-form'
import { User, UserRole } from '../model/user'
import { Dropdown } from 'primereact/dropdown'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { useState } from 'react'
import useAuth from '../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'

const GOOGLE_RECAPTCHA_KEY = import.meta.env.VITE_GOOGLE_RECAPTCHA_KEY ?? ''

type FormState = Omit<User, 'id'> & {
  capValue: string
  repeatPassword: string
}

const defaultValues: FormState = {
  username: '',
  password: '',
  repeatPassword: '',
  capValue: '',
  companyName: '',
  role: UserRole.CLIENT,
  ruc: '',
}

const userRoleOptions = [UserRole.ADMIN, UserRole.CREDITOR, UserRole.CLIENT]

const SignUpPage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const {
    formState: { errors },
    handleSubmit,
    control,
    reset,
  } = useForm({ defaultValues })

  const onSubmit = async (data: FormState) => {
    setError('')
    setLoading(true)

    const user: Omit<User, 'id'> = {
      username: data.username,
      password: data.password,
      role: data.role,
      companyName: data.companyName,
      ruc: data.ruc,
    }

    try {
      await register(user)
      reset()
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
          {errors[name].message}
        </small>
      )
    )
  }

  return (
    <main className="w-full h-screen flex">
      <h1 className="absolute top-5 left-5 text-xl font-bold">Discount Pro</h1>
      <div className="w-full h-full flex items-center">
        <div className="max-w-md w-full mx-auto">
          <h3 className="text-2xl font-bold">Crea una cuenta</h3>
          <p className="mt-1">
            Por favor, ingresa tus datos de tu empresa para registrarte y
            empezar a disfrutar de los beneficios de Discount Pro.
          </p>

          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="companyName" className="text-sm">
                Razón Social
              </label>
              <Controller
                control={control}
                name="companyName"
                rules={{ required: 'Este campo es requerido.' }}
                render={({ field, fieldState }) => (
                  <InputText
                    id={field.name}
                    {...field}
                    aria-errormessage="companyName-error"
                    invalid={fieldState.invalid}
                  />
                )}
              />
              {getErrorMessage('companyName')}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="ruc" className="text-sm">
                RUC
              </label>
              <Controller
                control={control}
                name="ruc"
                rules={{
                  required: 'Este campo es requerido.',
                  minLength: {
                    value: 11,
                    message: 'El RUC debe tener 11 caracteres.',
                  },
                  maxLength: {
                    value: 11,
                    message: 'El RUC debe tener 11 caracteres.',
                  },
                }}
                render={({ field, fieldState }) => (
                  <InputText
                    keyfilter={'int'}
                    id={field.name}
                    {...field}
                    aria-errormessage="ruc-error"
                    invalid={fieldState.invalid}
                    maxLength={11}
                  />
                )}
              />
              {getErrorMessage('ruc')}
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-sm">
                  Tipo de usuario
                </label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      onChange={(e) => field.onChange(e.value)}
                      options={userRoleOptions}
                    />
                  )}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
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
              <label htmlFor="repeatPassword" className="text-sm">
                Repetir contraseña
              </label>
              <Controller
                control={control}
                name="repeatPassword"
                rules={{ required: 'Este campo es requerido.' }}
                render={({ field, fieldState }) => (
                  <Password
                    id="repeatPassword"
                    {...field}
                    toggleMask
                    feedback={false}
                    inputClassName="w-full"
                    className="*:w-full"
                    aria-errormessage="repeatPassword-error"
                    invalid={fieldState.invalid}
                  />
                )}
              />
              {getErrorMessage('repeatPassword')}
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
              Registrarte
            </Button>

            <div className="flex justify-center gap-1 text-sm">
              <span>¿Tienes una cuenta?</span>
              <Link to="/login" className="text-indigo-500">
                Inicia sesión aquí
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

export default SignUpPage
