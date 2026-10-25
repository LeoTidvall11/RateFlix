import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MessageSquare } from 'lucide-react-native';
import GlassCard from 'components/GlassCard';
import { getMyComments } from 'services/api';
import { imageUrl } from 'services/externalApi';
import colors from 'theme/colors';

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function ProfileCommentItem({ comment, onPress }) {
  const { movie } = comment;
  const edited = comment.updatedAt !== comment.createdAt;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-3 rounded-xl border border-glass-border bg-black/20 p-3 active:opacity-80">
      <View className="h-[72px] w-12 overflow-hidden rounded-lg bg-ink-600">
        {movie.poster_path ? (
          <Image
            source={{ uri: imageUrl(movie.poster_path, 'w154') }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : null}
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} className="text-sm font-bold text-text-primary">
          {movie.title}
        </Text>
        <Text className="mt-1 text-sm leading-5 text-text-secondary">{comment.text}</Text>
        <Text className="mt-2 text-xs text-text-muted">
          {formatDate(comment.createdAt)}
          {edited ? ' · redigerad' : ''}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ProfileComments() {
  const navigation = useNavigation();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getMyComments()
        .then((data) => {
          if (!cancelled) setComments(data);
        })
        .catch((err) => console.error('Kunde inte hämta kommentarer:', err))
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <GlassCard className="mt-6">
      <View className="gap-4 p-4">
        <View>
          <Text className="text-lg font-bold text-text-primary">
            Mina kommentarer{comments.length ? ` (${comments.length})` : ''}
          </Text>
          <Text className="text-xs text-text-muted">Bara du kan se dina kommentarer</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.blood[600]} />
        ) : comments.length === 0 ? (
          <View className="items-center gap-2 py-4">
            <MessageSquare size={32} color={colors.text.secondary} />
            <Text className="text-center text-sm text-text-secondary">
              Du har inte kommenterat några filmer än. Markera en film som sedd för att kommentera
              den.
            </Text>
          </View>
        ) : (
          comments.map((comment) => (
            <ProfileCommentItem
              key={comment.id}
              comment={comment}
              onPress={() => navigation.navigate('movieDetail', { movieId: comment.movie.id })}
            />
          ))
        )}
      </View>
    </GlassCard>
  );
}
