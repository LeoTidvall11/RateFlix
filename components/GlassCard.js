import { View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LiquidGlassView, isLiquidGlassSupported } from 'components/liquidGlass';

// Glasyta med samma mönster som knapparna i Categories.
// Liquid Glass finns bara på iOS 26+, så på äldre iOS och på Android används BlurView.
// På Android blurrar BlurView inte som standard, där syns bara den halvgenomskinliga
// färgen. Därför ligger bg-black/20 och bg-glass med så att kortet ser ok ut ändå.
export default function GlassCard({ children, className = '' }) {
  const containerStyle = `overflow-hidden rounded-2xl border border-glass-border ${className}`;

  if (isLiquidGlassSupported) {
    return (
      <LiquidGlassView effect="clear" className={containerStyle}>
        {children}
      </LiquidGlassView>
    );
  }

  return (
    <View className={`${containerStyle} bg-black/20`}>
      <BlurView intensity={40} tint="dark">
        <View className="bg-glass">{children}</View>
      </BlurView>
    </View>
  );
}
