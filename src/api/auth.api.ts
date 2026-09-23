import { apiClient } from './client';

export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  accessToken: string;
  refreshToken: string;
};

export async function loginRequest(payload: LoginPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthUser>('/auth/login', {
    username: payload.username,
    password: payload.password,
    expiresInMins: 60,
  });
  return data;
}

export async function getCurrentUser(accessToken: string) {
  const { data } = await apiClient.get('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}