import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import GlassCard from 'components/GlassCard';
import CommentForm from 'components/comments/CommentForm';
import { useAuth } from 'context/authContext';
import { useLibrary, pickMovieFields } from 'context/LibraryContext';
import { useToast } from 'context/ToastContext';
import { getComments, addComment, updateComment, deleteComment } from 'services/api';
import colors from 'theme/colors';

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function CommentItem({ comment, onEdit, onDelete }) {
  const edited = comment.updatedAt !== comment.createdAt;

  return (
    <View className="rounded-xl border border-glass-border bg-black/20 p-3">
      <Text className="text-base leading-6 text-text-primary">{comment.text}</Text>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs text-text-muted">
          {formatDate(comment.createdAt)}
          {edited ? ' · redigerad' : ''}
        </Text>
        <View className="flex-row gap-4">
          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel="Ändra kommentar"
            hitSlop={8}>
            <Pencil size={18} color={colors.text.secondary} />
          </Pressable>
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="Ta bort kommentar"
            hitSlop={8}>
            <Trash2 size={18} color={colors.blood[400]} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function MovieComments({ movie }) {
  const { user } = useAuth();
  const { getStatus } = useLibrary();
  const { showToast } = useToast();
  const { watched } = getStatus(movie.id);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    getComments(movie.id)
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
  }, [movie.id, user?.id]);

  if (!user) return null;

  const handleAdd = async (text) => {
    try {
      const saved = await addComment(movie.id, text, pickMovieFields(movie));
      setComments((prev) => [saved, ...prev]);
      showToast('Kommentaren sparades');
    } catch (err) {
      console.error('Kunde inte spara kommentar:', err);
      showToast('Kunde inte spara kommentaren', 'error');
      throw err;
    }
  };

  const handleUpdate = async (commentId, text) => {
    try {
      const saved = await updateComment(commentId, text);
      setComments((prev) => prev.map((comment) => (comment.id === commentId ? saved : comment)));
      setEditingId(null);
      showToast('Kommentaren uppdaterades');
    } catch (err) {
      console.error('Kunde inte uppdatera kommentar:', err);
      showToast('Kunde inte uppdatera kommentaren', 'error');
      throw err;
    }
  };

  const removeComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      showToast('Kommentaren togs bort');
    } catch (err) {
      console.error('Kunde inte ta bort kommentar:', err);
      showToast('Kunde inte ta bort kommentaren', 'error');
    }
  };

  const handleDelete = (commentId) => {
    Alert.alert('Ta bort kommentar', 'Vill du ta bort kommentaren?', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Ta bort', style: 'destructive', onPress: () => removeComment(commentId) },
    ]);
  };

  return (
    <GlassCard className="mx-6 mt-6">
      <View className="gap-4 p-4">
        <View>
          <Text className="text-lg font-bold text-text-primary">Dina kommentarer</Text>
          <Text className="text-xs text-text-muted">Bara du kan se dina kommentarer</Text>
        </View>

        {watched ? (
          <CommentForm label="Ny kommentar" submitLabel="Lägg till" onSubmit={handleAdd} />
        ) : (
          <Text className="text-sm text-text-secondary">
            Markera filmen som sett för att kunna kommentera den.
          </Text>
        )}

        {loading ? (
          <ActivityIndicator color={colors.blood[600]} />
        ) : (
          comments.map((comment) =>
            comment.id === editingId ? (
              <CommentForm
                key={comment.id}
                label="Ändra kommentar"
                initialText={comment.text}
                submitLabel="Spara ändring"
                onSubmit={(text) => handleUpdate(comment.id, text)}
                onCancel={() => setEditingId(null)}
                autoFocus
              />
            ) : (
              <CommentItem
                key={comment.id}
                comment={comment}
                onEdit={() => setEditingId(comment.id)}
                onDelete={() => handleDelete(comment.id)}
              />
            )
          )
        )}
      </View>
    </GlassCard>
  );
}
