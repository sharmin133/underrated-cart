import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/HomeScreen';
import ProductFilterScreen from '../screens/ProductFilter/ProductFilterScreen';
import ProductDetailsScreen from '../screens/ProductDetails/ProductDetailsScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  ProductFilter: undefined;
  ProductDetails: { productId: number };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="ProductFilter"
        component={ProductFilterScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </Stack.Navigator>
  );
}