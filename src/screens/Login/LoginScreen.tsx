import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { colors, spacing, typography } from '../../theme/colors';
import { loginRequest } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthStack';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    console.log('LOGIN BUTTON PRESSED');
    if (!username.trim() || !password.trim()) {
      console.log('VALIDATION FAILED - empty fields');
      setError('Username and password are required.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const user = await loginRequest({ username: username.trim(), password });
      console.log('LOGIN SUCCESS, token:', user.accessToken);
      await login(user.accessToken, user.id);
      console.log('AUTH CONTEXT UPDATED');
    } catch (err) {
      console.log('LOGIN ERROR:', err);
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'<'}</Text>
        </Pressable>

        <Text style={styles.title}>Login</Text>

        <View style={styles.form}>
          <AppInput
            placeholder="Enter your username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
          <AppInput
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable style={styles.forgotWrapper}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>

          <AppButton
            label={loading ? 'Logging in...' : 'Login'}
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          />

          <View style={styles.signUpRow}>
            <Text style={styles.subtitle}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </Pressable>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <AppButton
            label="Sign in with Google"
            variant="outline"
            onPress={() => {}}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    marginTop: spacing.sm,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  form: {
    flex: 1,
  },
  errorText: {
    color: colors.primary,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  forgotWrapper: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: spacing.md,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  signUpText: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textSecondary,
    fontSize: 12,
  },
});