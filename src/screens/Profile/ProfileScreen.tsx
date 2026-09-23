import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ProfileMenuItem from '../../components/ProfileMenuItem';
import AppButton from '../../components/AppButton';
import { colors, spacing, typography } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

// Replace with the logged-in user's name/avatar once wired to auth state
const MOCK_USER = {
  name: 'Kashfe Ahmed',
  avatar: require('../../../assets/avatar-placeholder.png'),
};

export default function ProfileScreen() {
  const [logoutVisible, setLogoutVisible] = useState(false);
  const { logout } = useAuth();

  const handleConfirmLogout = async () => {
    await logout();
    setLogoutVisible(false);
    // No manual navigation needed — RootNavigator watches isAuthenticated
    // and swaps AppStack for AuthStack automatically.
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Ionicons name="menu-outline" size={24} color={colors.textPrimary} />
      </View>

      <View style={styles.profileBlock}>
        <View style={styles.avatarWrapper}>
          <Image source={MOCK_USER.avatar} style={styles.avatar} />
          <View style={styles.qrBadge}>
            <Ionicons name="qr-code-outline" size={14} color={colors.white} />
          </View>
        </View>
        <Text style={styles.name}>{MOCK_USER.name}</Text>
      </View>

      <View style={styles.menu}>
        <ProfileMenuItem icon="person-outline" label="Profile" onPress={() => {}} />
        <ProfileMenuItem icon="heart-outline" label="Favorite" onPress={() => {}} />
        <ProfileMenuItem icon="card-outline" label="Payment Method" onPress={() => {}} />
        <ProfileMenuItem icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => {}} />
        <ProfileMenuItem icon="settings-outline" label="Settings" onPress={() => {}} />
        <ProfileMenuItem icon="help-circle-outline" label="Help" onPress={() => {}} />
      </View>

      <Pressable onPress={() => setLogoutVisible(true)} style={styles.logoutRow}>
        <Ionicons name="log-out-outline" size={20} color={colors.primary} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <Modal transparent visible={logoutVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalActions}>
              <AppButton
                label="Cancel"
                variant="outline"
                onPress={() => setLogoutVisible(false)}
                style={styles.modalButton}
              />
              <AppButton
                label="Yes, Logout"
                onPress={handleConfirmLogout}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  headerTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.textPrimary,
  },
  profileBlock: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  qrBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  name: {
    ...typography.title,
    fontSize: 17,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  menu: {
    flex: 1,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  logoutText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
  },
  modalText: {
    ...typography.subtitle,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
});