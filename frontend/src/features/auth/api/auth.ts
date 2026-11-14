import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { AuthMessage, RegisterPayload, UserPublic } from '../types/auth'

export async function loginRequest(username: string, password: string): Promise<AuthMessage> {
  const form = new URLSearchParams()
  form.set('username', username)
  form.set('password', password)

  const { data } = await axiosInstance.post<AuthMessage>('/auth/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function registerRequest(payload: RegisterPayload): Promise<UserPublic> {
  const { data } = await axiosInstance.post<UserPublic>('/auth/register', payload)
  return data
}

export async function logoutRequest(): Promise<AuthMessage> {
  const { data } = await axiosInstance.post<AuthMessage>('/auth/logout')
  return data
}

export async function getMeRequest(): Promise<UserPublic> {
  const { data } = await axiosInstance.get<UserPublic>('/auth/me')
  return data
}
