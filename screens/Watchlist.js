import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Bookmark, Heart, CircleCheck } from 'lucide-react-native';
import ScreenBackground from 'components/ScreenBackground';
import { useLibrary } from 'context/LibraryContext';
import PosterTile from 'components/cards/PosterTile';
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
        className="mt-6 rounded-full bg-blood-700 px-5 py-3 active:opacity-80">
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
                movie={entry.movie}
                width={tileWidth}
                showFavorite={entry.isFavorite && activeKey !== 'favorites'}
                showWatched={entry.watched && activeKey !== 'watched'}
                onPress={() => openMovie(entry.movie.id)}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenBackground>
  );
}
