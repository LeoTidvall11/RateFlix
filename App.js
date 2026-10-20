import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import './global.css';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Homescreen from 'screens/HomeScreen';
import Watchlist from 'screens/Watchlist';
import Favorites from 'screens/Favorites';
import { TabBar } from 'components/TabBar';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Film, StarCheck, BookHeart, CircleUser } from 'lucide-react-native';
import DetailsPage from 'screens/DetailsPage';
import ProfilePage from 'screens/ProfilePage';

const tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
function TabNavigator() {
  return (
    <tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <tab.Screen
        name="home"
        component={Homescreen}
        options={{
          tabBarIcon: ({ color, size }) => <Film size={size} color={color} />,
        }}
      />

      <tab.Screen
        name="watchlist"
        component={Watchlist}
        options={{
          tabBarIcon: ({ color, size }) => <StarCheck size={size} color={color} />,
        }}
      />

      <tab.Screen
        name="favorites"
        component={Favorites}
        options={{
          tabBarIcon: ({ color, size }) => <BookHeart size={size} color={color} />,
        }}
      />

      <tab.Screen
        name="profile"
        component={ProfilePage}
        options={{
          tabBarIcon: ({ color, size }) => <CircleUser size={size} color={color} />,
        }}
      />
    </tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: '#040304' } }}>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="movieDetail" component={DetailsPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
