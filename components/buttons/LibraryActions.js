import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Bookmark, Heart, CircleCheck } from 'lucide-react-native';
import { useLibrary } from 'context/LibraryContext';
import colors from '../../theme/colors';

function ActionButton({ label, Icon, active, activeColor, fillWhenActive = true, onPress }) {
  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      className="flex-1 flex-row items-center justify-center rounded-full border py-2.5 active:opacity-70"
      style={{
        backgroundColor: active ? `${activeColor}26` : colors.glass.DEFAULT,
        borderColor: active ? activeColor : colors.glass.border,
      }}>
      <Icon
        size={18}
        color={active ? activeColor : colors.text.secondary}
        fill={active && fillWhenActive ? activeColor : 'transparent'}
      />
      <Text
        className="ml-2 text-sm font-semibold"
        style={{ color: active ? activeColor : colors.text.secondary }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function LibraryActions({ movie }) {
  const { getStatus, toggleWatchlist, toggleFavorite, toggleWatched } = useLibrary();
  const { inWatchlist, isFavorite, watched } = getStatus(movie.id);

  return (
    <View className="flex-row gap-2">
      <ActionButton
        label="Vill se"
        Icon={Bookmark}
        active={inWatchlist}
        activeColor={colors.gold}
        onPress={() => toggleWatchlist(movie)}
      />
      <ActionButton
        label="Favorit"
        Icon={Heart}
        active={isFavorite}
        activeColor={colors.blood[500]}
        onPress={() => toggleFavorite(movie)}
      />
      <ActionButton
        label="Sett"
        Icon={CircleCheck}
        active={watched}
        activeColor={colors.mint}
        fillWhenActive={false}
        onPress={() => toggleWatched(movie)}
      />
    </View>
  );
}
