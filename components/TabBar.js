import { Pressable, View } from 'react-native';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { BlurView } from 'expo-blur';

export function TabBar({ state, descriptors, navigation }) {
  const renderTabItems = () => (
    <View className="h-16 flex-row items-center justify-around px-2">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onpress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? route.name}
            onPress={onpress}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            className={`mx-1 flex-1 items-center justify-center rounded-2xl py-2 ${
              isFocused ? 'bg-white/20' : ''
            }`}>
            {options.tabBarIcon &&
              options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? '#FFFFFF' : '#FFFFFF80',
                size: 22,
              })}
          </Pressable>
        );
      })}
    </View>
  );

  const containerStyle =
    'absolute bottom-6 left-5 right-5 rounded-3xl border border-white/25 overflow-hidden shadow-2xl';

  if (isLiquidGlassSupported) {
    return (
      <LiquidGlassView effect="clear" interactive={true} className={containerStyle}>
        {renderTabItems()}
      </LiquidGlassView>
    );
  }
  return (
    <View className={`${containerStyle} bg-black/20`}>
      <BlurView intensity={45} tint="dark">
        {renderTabItems()}
      </BlurView>
    </View>
  );
}
