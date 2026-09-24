import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/colors';

type NotificationType = 'order' | 'offer' | 'system';

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const TYPE_META: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  order: { icon: 'bag-check-outline', color: '#2E7D32' },
  offer: { icon: 'pricetag-outline', color: '#EF6C00' },
  system: { icon: 'shield-checkmark-outline', color: '#1565C0' },
};

// Replace with real data later
const INITIAL: NotificationItem[] = [
  { id: '1', type: 'order', title: 'Order confirmed', message: 'Your order #1042 has been placed successfully.', time: '2m ago', read: false },
  { id: '2', type: 'offer', title: '20% off fresh fruits', message: 'Limited time offer on all fruits. Grab it today!', time: '1h ago', read: false },
  { id: '3', type: 'order', title: 'Out for delivery', message: 'Your order is on the way and will arrive soon.', time: '3h ago', read: false },
  { id: '4', type: 'system', title: 'Security alert', message: 'A new login was detected on your account.', time: 'Yesterday', read: true },
  { id: '5', type: 'offer', title: 'Free delivery weekend', message: 'No delivery charge on orders above $30.', time: '2d ago', read: true },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<NotificationItem[]>(INITIAL);

  const unread = useMemo(() => items.filter((i) => !i.read).length, [items]);

  const markRead = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));

  const markAllRead = () => setItems((prev) => prev.map((i) => ({ ...i, read: true })));

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
            <View style={[styles.heroCircle, styles.heroCircleA]} />
            <View style={[styles.heroCircle, styles.heroCircleB]} />

            <View style={styles.heroRow}>
              <View>
                <Text style={styles.heroTitle}>Notifications</Text>
                <Text style={styles.heroSubtitle}>
                  {unread > 0 ? `You have ${unread} unread` : "You're all caught up 🎉"}
                </Text>
              </View>
              {unread > 0 && (
                <Pressable
                  onPress={markAllRead}
                  style={({ pressed }) => [styles.markAll, pressed && { opacity: 0.7 }]}
                >
                  <Ionicons name="checkmark-done-outline" size={16} color={colors.white} />
                  <Text style={styles.markAllText}>Read all</Text>
                </Pressable>
              )}
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const meta = TYPE_META[item.type];
          return (
            <Pressable
              onPress={() => markRead(item.id)}
              style={({ pressed }) => [
                styles.card,
                !item.read && styles.cardUnread,
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: meta.color + '1A' }]}>
                <Ionicons name={meta.icon} size={22} color={meta.color} />
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardTime}>{item.time}</Text>
                </View>
                <Text style={styles.cardMessage} numberOfLines={2}>
                  {item.message}
                </Text>
              </View>

              {!item.read && <View style={styles.dot} />}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={36} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>We'll let you know when something arrives.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xl },

  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: 30,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  heroCircle: { position: 'absolute', backgroundColor: colors.white, opacity: 0.1, borderRadius: 999 },
  heroCircleA: { width: 200, height: 200, top: -70, right: -50 },
  heroCircleB: { width: 140, height: 140, bottom: -60, left: -40 },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  heroTitle: { ...typography.title, fontSize: 26, color: colors.white },
  heroSubtitle: { ...typography.subtitle, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  markAllText: { color: colors.white, fontSize: 12, fontWeight: '700' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { ...typography.title, fontSize: 14, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  cardTime: { fontSize: 11, color: colors.textSecondary },
  cardMessage: { ...typography.subtitle, fontSize: 12, lineHeight: 17, color: colors.textSecondary, marginTop: 3 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },

  emptyState: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { ...typography.title, fontSize: 17, color: colors.textPrimary },
  emptyText: { ...typography.subtitle, fontSize: 13, color: colors.textSecondary, marginTop: 4 },
});