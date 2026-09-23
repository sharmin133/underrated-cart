import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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

export default function SplashScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Replace with your actual cart icon asset */}
        <Image
          source={require('../../../assets/cart-icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />

        <Text style={styles.title}>Underrated Cart</Text>

        <Text style={styles.heading}>Let's get started!</Text>
        <Text style={styles.subtitle}>
          Login to enjoy the features we've provided, and stay healthy!
        </Text>
      </View>

      <View style={styles.actions}>
        <AppButton label="Login" onPress={() => navigation.navigate('Login')} />
        <AppButton
          label="Sign Up"
          variant="outline"
          onPress={() => navigation.navigate('SignUp')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 90,
    height: 90,
    marginBottom: spacing.md,
    tintColor: colors.primary,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  heading: {
    ...typography.title,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  actions: {
    paddingBottom: spacing.xl,
  },
});