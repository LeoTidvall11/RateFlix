import { useState } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Bookmark, Heart, CircleCheck } from 'lucide-react-native';
import ScreenBackground from 'components/ScreenBackground';
import { useLibrary } from 'context/LibraryContext';
import { imageUrl } from 'services/externalApi';
import colors from '../theme/colors';

const TABS = [
  {
    key: 'watchlist',
    label: 'Vill se',
    Icon: Bookmark,
    color: colors.gold,
    emptyTitle: 'Din watchlist är tom',
    emptyText: 'Spara filmer du vill se genom att trycka på "Vill se" på en film.',
  },
  {
    key: 'watched',
    label: 'Sett',
    Icon: CircleCheck,
    color: colors.mint,
    emptyTitle: 'Inga sedda filmer än',
    emptyText: 'Markera filmer som sedda för att hålla koll på vad du har tittat på.',
  },
  {
    key: 'favorites',
    label: 'Favoriter',
    Icon: Heart,
    color: colors.blood[500],
    emptyTitle: 'Inga favoriter än',
    emptyText: 'Tryck på hjärtat på en film för att lägga till den bland dina favoriter.',
  },
];

const COLUMNS = 3;
const GAP = 12;
const SIDE_PADDING = 16;

function SegmentedControl({ activeKey, counts, onChange }) {
  return (
    <View
      className="flex-row rounded-full border p-1"
      style={{ backgroundColor: colors.glass.DEFAULT, borderColor: colors.glass.border }}>
      {TABS.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={`flex-1 flex-row items-center justify-center rounded-full py-2 ${
              active ? 'bg-blood-700' : ''
            }`}>
            <Text
              className={`text-sm font-semibold ${active ? 'text-text-onRed' : 'text-text-secondary'}`}>
              {tab.label}
            </Text>
            <Text className={`ml-1.5 text-xs ${active ? 'text-text-onRed/80' : 'text-text-muted'}`}>
              {counts[tab.key]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PosterTile({ entry, width, activeKey, onPress }) {
  const { movie } = entry;
  // Visa status från de andra listorna, inte den man redan tittar på
  const showFavorite = entry.isFavorite && activeKey !== 'favorites';
  const showWatched = entry.watched && activeKey !== 'watched';
  const height = width * 1.5;
  const year = movie.release_date?.split('-')[0];

  return (
    <Pressable onPress={onPress} style={{ width }} className="active:opacity-80">
      <View
        style={{ width, height }}
        className="overflow-hidden rounded-xl bg-ink-600 shadow-lg shadow-blood-600">
        {movie.poster_path ? (
          <Image
            source={{ uri: imageUrl(movie.poster_path, 'w342') }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center p-2">
            <Text className="text-center text-xs text-text-secondary">{movie.title}</Text>
          </View>
        )}

        {showFavorite || showWatched ? (
          <View className="absolute right-1.5 top-1.5 flex-row gap-1">
            {showFavorite ? (
              <View className="rounded-full p-1" style={{ backgroundColor: colors.glass.dark }}>
                <Heart size={12} color={colors.blood[500]} fill={colors.blood[500]} />
              </View>
            ) : null}
            {showWatched ? (
              <View className="rounded-full p-1" style={{ backgroundColor: colors.glass.dark }}>
                <CircleCheck size={12} color={colors.mint} />
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <Text numberOfLines={1} className="mt-1.5 text-xs font-semibold text-text-primary">
        {movie.title}
      </Text>
      {year ? <Text className="text-[11px] text-text-muted">{year}</Text> : null}
    </Pressable>
  );
}

function EmptyState({ tab, onExplore }) {
  const { Icon } = tab;
  return (
    <View className="mt-16 items-center px-8">
      <View className="mb-4 rounded-full p-5" style={{ backgroundColor: colors.glass.DEFAULT }}>
        <Icon size={32} color={tab.color} />
      </View>
      <Text className="text-lg font-bold text-text-primary">{tab.emptyTitle}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-text-secondary">
        {tab.emptyText}
      </Text>
      <Pressable
        onPress={onExplore}
        className="mt-6 rounded-full bg-blood-700 px-6 py-3 active:opacity-80">
        <Text className="font-semibold text-text-onRed">Utforska filmer</Text>
      </Pressable>
    </View>
  );
}

export default function Watchlist({ navigation }) {
  const library = useLibrary();
  const [activeKey, setActiveKey] = useState('watchlist');
  const { width } = useWindowDimensions();

  const tileWidth = (width - SIDE_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const activeTab = TABS.find((t) => t.key === activeKey);
  const items = library[activeKey];
  const counts = Object.fromEntries(TABS.map((t) => [t.key, library[t.key].length]));

  const openMovie = (movieId) => navigation.navigate('movieDetail', { movieId });

  return (
    <ScreenBackground>
      <View style={{ paddingHorizontal: SIDE_PADDING }}>
        <Text className="mb-4 text-3xl font-extrabold text-text-primary">Mitt bibliotek</Text>

        <SegmentedControl activeKey={activeKey} counts={counts} onChange={setActiveKey} />

        {library.loading ? (
          <ActivityIndicator className="mt-16" color={colors.blood[600]} size="large" />
        ) : items.length === 0 ? (
          <EmptyState tab={activeTab} onExplore={() => navigation.navigate('search')} />
        ) : (
          <View className="mt-5 flex-row flex-wrap" style={{ gap: GAP, rowGap: 18 }}>
            {items.map((entry) => (
              <PosterTile
                key={entry.movie.id}
                entry={entry}
                width={tileWidth}
                activeKey={activeKey}
                onPress={() => openMovie(entry.movie.id)}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenBackground>
  );
}
