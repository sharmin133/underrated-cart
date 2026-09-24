import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../../components/AppButton';
import { colors, spacing, typography } from '../../theme/colors';
import { HomeStackParamList } from '../../navigation/HomeStack';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'Success'>;

export default function SuccessScreen() {
  const navigation = useNavigation<NavProp>();

  const handleContinueShopping = () => {
    // Reset the stack back to HomeMain so the user can't swipe back
    // through Checkout/Cart into an order that's already been placed.
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'HomeMain' }],
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={48} color={colors.white} />
        </View>

        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>
          Your order has been placed successfully. You'll receive an update once it's on the way.
        </Text>
      </View>

      <View style={styles.footer}>
        <AppButton label="Continue Shopping" onPress={handleContinueShopping} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.subtitle,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});