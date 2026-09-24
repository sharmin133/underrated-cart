import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigatorScreenParams,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HomeStack, { HomeStackParamList } from './HomeStack';
import ProductsScreen from '../screens/Products/ProductsScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { colors } from '../theme/colors';

export type AppTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Products: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

const ICONS = {
  Home: ['home', 'home-outline'],
  Products: ['grid', 'grid-outline'],
  Notifications: ['notifications', 'notifications-outline'],
  Profile: ['person', 'person-outline'],
} as const;

export default function AppStack() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  const tabBarStyle = {
    height: 56 + bottomInset,
    paddingTop: 6,
    paddingBottom: bottomInset,
    borderTopWidth: 0,
    backgroundColor: colors.white,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        // Home tab-er bhetore kon screen focus-e ache
        const focusedScreen = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
        const hideTabBar = route.name === 'Home' && focusedScreen !== 'HomeMain';

        return {
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarStyle: hideTabBar ? { display: 'none' } : tabBarStyle,
          tabBarIcon: ({ color, size, focused }) => {
            const [active, inactive] = ICONS[route.name];
            return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
          },
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}