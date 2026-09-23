import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { FilterProvider } from './src/context/FilterContext';
import { CartProvider } from './src/context/CartContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
  <SafeAreaProvider>
  <AuthProvider>
    <CartProvider>
      <FilterProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </FilterProvider>
    </CartProvider>
  </AuthProvider>
  <StatusBar style="auto" />
</SafeAreaProvider>
  );
}