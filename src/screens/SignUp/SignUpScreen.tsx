import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/colors';

export default function SignUpScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>{'<'}</Text>
      </Pressable>
      <View style={styles.content}>
        <Text style={styles.title}>Sign Up Screen — coming next</Text>
      </View>
    </SafeAreaView>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
});