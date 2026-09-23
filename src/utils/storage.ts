import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'uc_access_token';
const USER_ID_KEY = 'uc_user_id';

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_ID_KEY);
}

export async function saveUserId(userId: number) {
  await SecureStore.setItemAsync(USER_ID_KEY, String(userId));
}

export async function getUserId(): Promise<number | null> {
  const value = await SecureStore.getItemAsync(USER_ID_KEY);
  return value ? Number(value) : null;
}