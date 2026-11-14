import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'

interface LocationState {
  from?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [serverError, setServerError] = useState<string | null>(null)

  const fromPath = (location.state as LocationState | null)?.from

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      try {
        const user = await login(value.username.trim(), value.password)
        if (fromPath) {
          navigate(fromPath, { replace: true })
        } else if (user.role === 'admin') {
          navigate('/admin/resumen', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : 'No se pudo iniciar sesión',
        )
      }
    },
  })

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ingresá con tu usuario y contraseña para continuar.
          </p>
        </div>

        {serverError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {serverError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? 'El usuario es obligatorio' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="login-username"
                label="Usuario *"
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Ej. juan"
                error={
                  field.state.meta.errors.length > 0
                    ? String(field.state.meta.errors[0])
                    : undefined
                }
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                !value ? 'La contraseña es obligatoria' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="login-password"
                label="Contraseña *"
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="••••••••"
                error={
                  field.state.meta.errors.length > 0
                    ? String(field.state.meta.errors[0])
                    : undefined
                }
              />
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.isSubmitting] as const}
          >
            {([isSubmitting]) => (
              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full mt-2"
              >
                Ingresar
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="text-sm text-center text-slate-600 mt-6">
          ¿Todavía no tenés cuenta?{' '}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Registrate acá
          </Link>
        </p>
      </Card>
    </div>
  )
}
