import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { Film, StarCheck, CircleUser, SearchIcon } from 'lucide-react-native';
import Homescreen from 'screens/HomeScreen';
import Watchlist from 'screens/Watchlist';
import DetailsPage from 'screens/DetailsPage';
import ProfilePage from 'screens/ProfilePage';
import Search from 'screens/Search';
import { TabBar } from 'components/TabBar';
import ScreenBackground from 'components/ScreenBackground';
import { useAuth } from 'context/authContext';
import colors from 'theme/colors';

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
        name="search"
        component={Search}
        options={{
          tabBarIcon: ({ color, size }) => <SearchIcon size={size} color={color} />,
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

export default function AppNavigator() {
  const { isLoading } = useAuth();
  if (isLoading) {
    return (
      <ScreenBackground>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.blood[600]} />
        </View>
      </ScreenBackground>
    );
  }
  return (
    <NavigationContainer
      theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: '#040304' } }}>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="movieDetail" component={DetailsPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
