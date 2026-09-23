import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'uc_access_token';

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}