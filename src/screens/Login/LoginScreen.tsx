import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
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

  // Entrance animation
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  const handleLogin = async () => {
   
    if (!username.trim() || !password.trim()) {
      console.log('VALIDATION FAILED - empty fields');
      setError('Username and password are required.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const user = await loginRequest({ username: username.trim(), password });
    
      await login(user.accessToken, user.id);
     
    } catch (err) {
      console.log('LOGIN ERROR:', err);
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container}>
        {/* Background decoration */}
        <View style={[styles.blob, styles.blobTop]} />
        <View style={[styles.blob, styles.blobBottom]} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.backText}>{'‹'}</Text>
          </Pressable>

          <Animated.View
            style={{ opacity: fade, transform: [{ translateY: slide }] }}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome back 👋</Text>
              <View style={styles.divider} />
              <Text style={styles.headerSubtitle}>
                Login to continue shopping and stay healthy!
              </Text>
            </View>

            {/* Form card */}
            <View style={styles.card}>
              <Text style={styles.label}>Username</Text>
              <AppInput
                placeholder="Enter your username"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />

              <Text style={styles.label}>Password</Text>
              <AppInput
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️  {error}</Text>
                </View>
              )}

              <Pressable style={styles.forgotWrapper}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>

              <AppButton
                label={loading ? 'Logging in...' : 'Login'}
                onPress={handleLogin}
                disabled={loading}
                style={styles.loginButton}
              />
            </View>

            {/* Divider */}
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

            {/* Sign up */}
            <View style={styles.signUpRow}>
              <Text style={styles.subtitle}>Don't have an account? </Text>
              <Pressable onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpText}>Sign Up</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Decorative circles
  blob: {
    position: 'absolute',
    backgroundColor: colors.primary,
    opacity: 0.08,
    borderRadius: 999,
  },
  blobTop: {
    width: 240,
    height: 240,
    top: -90,
    right: -80,
  },
  blobBottom: {
    width: 300,
    height: 300,
    bottom: -140,
    left: -120,
  },

  backButton: {
    marginTop: spacing.sm,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  backText: {
    fontSize: 28,
    lineHeight: 30,
    color: colors.textPrimary,
    marginTop: -2,
  },

  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    fontSize: 30,
    color: colors.textPrimary,
  },
  divider: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  headerSubtitle: {
    ...typography.subtitle,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  errorBox: {
    backgroundColor: '#FDECEA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '500',
  },

  forgotWrapper: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  forgotText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: 0,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
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
    fontWeight: '600',
  },

  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  signUpText: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '700',
  },
});