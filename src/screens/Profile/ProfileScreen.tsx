import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ProfileMenuItem from "../../components/ProfileMenuItem";
import AppButton from "../../components/AppButton";
import { colors, spacing, typography } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";
import { getCurrentUser } from "../../api/auth.api";
import { getToken } from "../../utils/storage";

const FALLBACK_AVATAR = require("../../../assets/avatar-placeholder.png");

const MENU = [
  ["person-outline", "Profile"],
  ["heart-outline", "Favorite"],
  ["card-outline", "Payment Method"],
  ["shield-checkmark-outline", "Privacy Policy"],
  ["settings-outline", "Settings"],
  ["help-circle-outline", "Help"],
] as const;

const DANGER = "#C62828";
const DANGER_BG = "#FDECEA";

type CurrentUser = {
  username: string;
  firstName: string;
  lastName: string;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await getCurrentUser(token);
          setUser(data);
        }
      } catch (err) {
        // Session may have expired — screen still renders with fallback name
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  const handleConfirmLogout = async () => {
    await logout();
    setLogoutVisible(false);
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : "Guest";
  const username = user?.username ?? "";
  const qrCodeUrl = username
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(username)}`
    : null;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Ionicons name="menu-outline" size={24} color={colors.white} />
        </View>

        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            <Image source={FALLBACK_AVATAR} style={styles.avatar} />
          </View>

          {loadingUser ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginTop: spacing.xs }}
            />
          ) : (
            <>
              <Text style={styles.name}>{displayName}</Text>
              {!!username && <Text style={styles.username}>@{username}</Text>}
            </>
          )}

          <Pressable
            style={styles.qrButton}
            onPress={() => setQrVisible(true)}
            disabled={!qrCodeUrl}
          >
            <Ionicons name="qr-code-outline" size={16} color={colors.primary} />
            <Text style={styles.qrButtonText}>Show QR Code</Text>
          </Pressable>
        </View>

        <View style={styles.menuCard}>
          {MENU.map(([icon, label]) => (
            <ProfileMenuItem
              key={label}
              icon={icon}
              label={label}
              onPress={() => {}}
            />
          ))}
        </View>

        <Pressable
          onPress={() => setLogoutVisible(true)}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={20} color={DANGER} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      <Modal transparent visible={logoutVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalText}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalActions}>
              <AppButton
                label="Cancel"
                variant="outline"
                onPress={() => setLogoutVisible(false)}
                style={{ flex: 1 }}
              />
              <AppButton
                label="Yes, Logout"
                onPress={handleConfirmLogout}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={qrVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.qrModalCard}>
            <Pressable
              style={styles.qrCloseButton}
              onPress={() => setQrVisible(false)}
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </Pressable>

            {qrCodeUrl && (
              <Image
                source={{ uri: qrCodeUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            )}
            <Text style={styles.qrUsername}>@{username}</Text>
            <Text style={styles.qrHint}>Scan to view this profile</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    height: 190,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: { ...typography.title, fontSize: 20, color: colors.white },
  card: {
    marginHorizontal: spacing.lg,
    marginTop: -60,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 24,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  avatarWrapper: {
    position: "absolute",
    top: -45,
    width: 96,
    height: 96,
    padding: 4,
    borderRadius: 48,
    backgroundColor: colors.white,
    elevation: 6,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 44 },
  name: { ...typography.title, fontSize: 20, color: colors.textPrimary },
  username: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 4,
  },
  qrButtonText: {
    ...typography.subtitle,
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  menuCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 24,
    elevation: 3,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: DANGER_BG,
  },
  logoutText: { ...typography.button, color: DANGER, marginLeft: spacing.xs },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  modalText: {
    ...typography.subtitle,
    fontSize: 15,
    textAlign: "center",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  modalActions: { flexDirection: "row", gap: spacing.sm },
  qrModalCard: {
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: 24,
    alignItems: "center",
  },
  qrCloseButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  qrUsername: {
    ...typography.title,
    fontSize: 16,
    color: colors.textPrimary,
  },
  qrHint: {
    ...typography.subtitle,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
