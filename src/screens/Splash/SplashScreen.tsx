import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppButton from '../../components/AppButton';
import { colors, spacing, typography } from '../../theme/colors';

type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
};

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

const FEATURES = ['🥗 Healthy picks', '🚚 Fast delivery', '💸 Best prices'];

export default function SplashScreen() {
  const navigation = useNavigation<NavProp>();

  // Entrance animation
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide, logoScale]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Background decoration */}
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      <View style={styles.content}>
        {/* Logo inside a soft card */}
        <Animated.View
          style={[styles.logoWrapper, { transform: [{ scale: logoScale }] }]}
        >
          <View style={styles.logoCard}>
            <Image
              source={require('../../../assets/cart-icon.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.View
          style={{
            alignItems: 'center',
            opacity: fade,
            transform: [{ translateY: slide }],
          }}
        >
          <Text style={styles.title}>Underrated Cart</Text>
          <View style={styles.divider} />

          <Text style={styles.heading}>Let's get started!</Text>
          <Text style={styles.subtitle}>
            Login to enjoy the features we've provided, and stay healthy!
          </Text>

          <View style={styles.chipRow}>
            {FEATURES.map((item) => (
              <View key={item} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.actions, { opacity: fade }]}>
        <AppButton label="Login" onPress={() => navigation.navigate('Login')} />
        <View style={{ height: spacing.sm }} />
        <AppButton
          label="Sign Up"
          variant="outline"
          onPress={() => navigation.navigate('SignUp')}
        />
        <Text style={styles.footer}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  // Decorative circles
  blob: {
    position: 'absolute',
    backgroundColor: colors.primary,
    opacity: 0.08,
    borderRadius: 999,
  },
  blobTop: {
    width: 260,
    height: 260,
    top: -90,
    right: -80,
  },
  blobBottom: {
    width: 320,
    height: 320,
    bottom: -140,
    left: -120,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoWrapper: {
    marginBottom: spacing.lg,
  },
  logoCard: {
    width: 130,
    height: 130,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    width: 70,
    height: 70,
    tintColor: colors.primary,
  },

  title: {
    ...typography.title,
    fontSize: 32,
    letterSpacing: 0.5,
    color: colors.textPrimary,
  },
  divider: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  heading: {
    ...typography.title,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subtitle,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  actions: {
    paddingBottom: spacing.xl,
  },
  footer: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
  },
});