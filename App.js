import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import Homescreen from 'screens/HomeScreen';
import Watchlist from 'screens/Watchlist';
import Favorites from 'screens/Favorites';
import Search from 'screens/Search';

export default function App() {
  const tab = createBottomTabNavigator();
  return (
    <NavigationContainer>
      <tab.Navigator>
        <tab.Screen name="home" component={Homescreen} />

        <tab.Screen name="watchlist" component={Watchlist} />

        <tab.Screen name="favorites" component={Favorites} />

        <tab.Screen name="search" component={Search} />
      </tab.Navigator>
    </NavigationContainer>
  );
}
