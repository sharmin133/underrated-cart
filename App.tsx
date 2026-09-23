import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthStack from './src/navigation/AuthStack';


export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}