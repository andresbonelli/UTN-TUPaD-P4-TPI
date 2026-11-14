import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      try {
        await register({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        navigate('/', { replace: true })
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : 'No se pudo completar el registro',
        )
      }
    },
  })

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="text-sm text-slate-500 mt-1">
            Registrate como cliente para hacer pedidos en Food Store.
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
              onChange: ({ value }) => {
                const cleaned = value.trim()
                if (!cleaned) return 'El usuario es obligatorio'
                if (cleaned.length < 2) return 'Debe tener al menos 2 caracteres'
                return undefined
              },
            }}
          >
            {(field) => (
              <Input
                id="reg-username"
                label="Nombre de usuario *"
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Ej. mariag"
                error={
                  field.state.meta.errors.length > 0
                    ? String(field.state.meta.errors[0])
                    : undefined
                }
              />
            )}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) => {
                const cleaned = value.trim()
                if (!cleaned) return 'El nombre completo es obligatorio'
                if (cleaned.length < 2) return 'Debe tener al menos 2 caracteres'
                return undefined
              },
            }}
          >
            {(field) => (
              <Input
                id="reg-fullname"
                label="Nombre completo *"
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Ej. María Gómez"
                error={
                  field.state.meta.errors.length > 0
                    ? String(field.state.meta.errors[0])
                    : undefined
                }
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const cleaned = value.trim()
                if (!cleaned) return 'El email es obligatorio'
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
                  return 'Ingresá un email válido'
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <Input
                id="reg-email"
                label="Email *"
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="maria@example.com"
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
              onChange: ({ value }) => {
                if (!value) return 'La contraseña es obligatoria'
                if (value.length < 8) return 'Debe tener al menos 8 caracteres'
                return undefined
              },
            }}
          >
            {(field) => (
              <Input
                id="reg-password"
                label="Contraseña (mínimo 8 caracteres) *"
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
                Registrarme
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="text-sm text-center text-slate-600 mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  )
}
