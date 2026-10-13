import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import './global.css';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Homescreen from 'screens/HomeScreen';
import Watchlist from 'screens/Watchlist';
import Favorites from 'screens/Favorites';
import Search from 'screens/Search';
import { TabBar } from 'components/TabBar';

import { Film, StarCheck, BookHeart, CircleUser } from 'lucide-react-native';

export default function App() {
  const tab = createBottomTabNavigator();
  return (
    <NavigationContainer
      theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: '#040304' } }}>
      <StatusBar style="light" />
      <tab.Navigator
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarTransparent: true,
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
          name="search"
          component={Search}
          options={{
            tabBarIcon: ({ color, size }) => <CircleUser size={size} color={color} />,
          }}
        />
      </tab.Navigator>
    </NavigationContainer>
  );
}
