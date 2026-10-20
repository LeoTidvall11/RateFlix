// Detaljsidan för en film. Den får bara movieId via navigationen och hämtar resten
// själv från TMDB (getMovieDetails tar med credits så skådespelarna kommer i samma anrop).
// Sidan är uppdelad i sektioner uppifrån och ner: hero-bild, poster + titel, chips,
// knappar, handling och skådespelare. Allt ligger i ScreenBackground som redan är en
// ScrollView, så här inne får det INTE finnas en till vertikal ScrollView, då slutar
// parallax-bakgrunden fungera.

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Star, Calendar, Clock, Bookmark } from 'lucide-react-native';
import { useFetch } from 'hooks/useFetch';
import { getMovieDetails, imageUrl } from 'services/externalApi';
import ScreenBackground from 'components/ScreenBackground';
import { LiquidGlassView, isLiquidGlassSupported } from 'components/liquidGlass';
import colors from 'theme/colors';

// Glasyta med samma mönster som knapparna i Categories.
// Liquid Glass finns bara på iOS 26+, så på äldre iOS och på Android används BlurView.
// På Android blurrar BlurView inte som standard, där syns bara den halvgenomskinliga
// färgen. Därför ligger bg-black/20 och bg-glass med så att kortet ser ok ut ändå.
function GlassCard({ children, className = '' }) {
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

function MovieInfo({
  icon: Icon,
  label,
  color = colors.text.secondary,
  className = 'border-glass-border bg-glass',
}) {
  return (
    <View className={`flex-row items-center gap-1 rounded-full border px-3 py-1 ${className}`}>
      <Icon size={14} color={color} fill={Icon === Star ? color : 'none'} />
      <Text style={{ color }} className="text-xs font-semibold">
        {label}
      </Text>
    </View>
  );
}

export default function MovieDetailScreen({ route, navigation }) {
  const { movieId } = route.params;
  const { height } = useWindowDimensions();

  const fetcher = useCallback(() => getMovieDetails(movieId), [movieId]);
  const { data: movie, loading, error } = useFetch(fetcher);

  const [userRating, setUserRating] = useState(0);

  const releaseYear = movie?.release_date ? movie.release_date.split('-')[0] : '';
  const cast = movie?.credits?.cast?.slice(0, 12) ?? [];

  if (loading) {
    return (
      <ScreenBackground>
        <View className="flex-1 items-center justify-center">
          {/* Färgen måste skickas som prop, className fungerar inte på ActivityIndicator */}
          <ActivityIndicator color={colors.blood[600]} size="large" />
        </View>
      </ScreenBackground>
    );
  }

  if (error || !movie) {
    return (
      <ScreenBackground>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-center text-text-primary">
            Det gick inte att ladda filmen: {error}
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    // paddingTop 0 tar bort ScreenBackgrounds safe-area-padding så att bilden går ända upp
    <ScreenBackground contentContainerStyle={{ paddingTop: 0 }}>
      {/* Hero, halva skärmhöjden så att det ser likadant ut på små och stora telefoner */}
      <View style={{ height: height * 0.5 }} className="w-full bg-ink-800">
        {movie.backdrop_path || movie.poster_path ? (
          <Image
            source={{ uri: imageUrl(movie.backdrop_path || movie.poster_path, 'w780') }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : null}

        <LinearGradient
          colors={['rgba(4,3,4,0.6)', 'transparent', colors.ink[950]]}
          locations={[0, 0.4, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Tillbaka"
          className="absolute left-4 mt-10 h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-glass-dark">
          <ChevronLeft color={colors.text.primary} size={24} />
        </Pressable>
      </View>

      {/* Poster + titel. Negativ marginal gör att de lägger sig ovanpå hero-bilden */}
      <View className="-mt-24 flex-row items-end gap-4 px-6">
        {movie.poster_path ? (
          <Image
            source={{ uri: imageUrl(movie.poster_path, 'w342') }}
            className="h-40 w-28 rounded-xl border border-glass-border"
          />
        ) : null}
        <View className="flex-1 pb-1">
          <Text className="text-2xl font-extrabold text-text-primary" numberOfLines={3}>
            {movie.title}
          </Text>
          {movie.tagline ? (
            <Text className="mt-1 text-sm italic text-text-muted">{movie.tagline}</Text>
          ) : null}
        </View>
      </View>

      <View className="mt-5 flex-row flex-wrap gap-2 px-6">
        {movie.vote_average ? (
          <MovieInfo
            icon={Star}
            label={movie.vote_average.toFixed(1)}
            color={colors.gold}
            className="border-gold/30 bg-gold/15"
          />
        ) : null}
        {releaseYear ? <MovieInfo icon={Calendar} label={releaseYear} /> : null}
        {movie.runtime ? <MovieInfo icon={Clock} label={`${movie.runtime} min`} /> : null}
      </View>

      {movie.genres?.length ? (
        <View className="mt-4 flex-row flex-wrap gap-2 px-6">
          {movie.genres.map((genre) => (
            <View key={genre.id} className="rounded-full bg-glass-tint px-3 py-1">
              <Text className="text-xs text-blood-300">{genre.name}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View className="mt-6 gap-3 px-6">
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-blood-700 p-4
          ">
          <Bookmark size={20} color={colors.text.onRed} />
          <Text className={'font-bold uppercase tracking-wider color-text-onRed'}>
            {' '}
            Lägg till i wishlist{' '}
          </Text>
        </Pressable>

        <GlassCard>
          <View className="flex-row items-center justify-between p-4">
            <Text className="font-semibold text-text-primary">Ditt betyg</Text>
            <View className="flex-row gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setUserRating(star === userRating ? 0 : star)}
                  accessibilityRole="button"
                  // För VoiceOver/TalkBack, annars läses bara "knapp" upp
                  accessibilityLabel={`Betygsätt ${star} av 5`}
                  hitSlop={4}>
                  <Star
                    size={26}
                    color={star <= userRating ? colors.gold : colors.text.muted}
                    fill={star <= userRating ? colors.gold : 'none'}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </GlassCard>
      </View>

      <GlassCard className="mx-6 mt-6">
        <View className="p-4">
          <Text className="mb-2 text-lg font-bold text-text-primary">Handling</Text>
          <Text className="text-base leading-6 text-text-secondary">
            {movie.overview || 'Ingen beskrivning tillgänglig.'}
          </Text>
        </View>
      </GlassCard>

      {cast.length ? (
        <View className="mt-8">
          <Text className="mb-3 px-6 text-lg font-bold text-text-primary">Skådespelare</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
            {cast.map((person) => (
              <View key={person.credit_id} className="w-20 items-center">
                {person.profile_path ? (
                  <Image
                    source={{ uri: imageUrl(person.profile_path, 'w185') }}
                    className="h-20 w-20 rounded-full border border-glass-border"
                  />
                ) : (
                  <View className="h-20 w-20 items-center justify-center rounded-full border border-glass-border bg-glass">
                    <Text className="text-xl font-bold text-text-muted">
                      {person.name?.[0] ?? '?'}
                    </Text>
                  </View>
                )}
                <Text
                  className="mt-2 text-center text-xs font-semibold text-text-primary"
                  numberOfLines={2}>
                  {person.name}
                </Text>
                {person.character ? (
                  <Text className="text-center text-xs text-text-muted" numberOfLines={1}>
                    {person.character}
                  </Text>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </ScreenBackground>
  );
}
