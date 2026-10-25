import { useId, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import colors from 'theme/colors';

export const MAX_COMMENT_LENGTH = 1000;

export default function CommentForm({
  initialText = '',
  label = 'Din kommentar',
  submitLabel = 'Spara',
  onSubmit,
  onCancel,
  autoFocus = false,
}) {
  const [text, setText] = useState(initialText);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const labelId = useId();

  const handleChangeText = (value) => {
    setText(value);
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      setError('Kommentaren får inte vara tom');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(trimmedText);
      if (!onCancel) setText('');
    } catch {
      setError('Det gick inte att spara kommentaren');
    } finally {
      setSubmitting(false);
    }
  };

  const isUnchanged = onCancel && text.trim() === initialText.trim();
  const disabled = submitting || isUnchanged;

  return (
    <View>
      <Text nativeID={labelId} className="mb-1 text-xs font-semibold uppercase text-text-secondary">
        {label}
      </Text>
      <TextInput
        value={text}
        onChangeText={handleChangeText}
        placeholder="Vad tyckte du om filmen?"
        placeholderTextColor={colors.text.muted}
        accessibilityLabel={label}
        accessibilityLabelledBy={labelId}
        multiline
        maxLength={MAX_COMMENT_LENGTH}
        autoFocus={autoFocus}
        editable={!submitting}
        textAlignVertical="top"
        className="min-h-24 rounded-xl border border-glass-border bg-black/30 px-4 py-3 text-text-primary"
        style={error ? { borderColor: colors.blood[400] } : null}
      />

      <View className="mt-1 flex-row justify-between">
        <Text className="text-xs text-blood-300">{error ?? ''}</Text>
        <Text className="text-xs text-text-muted">
          {text.length}/{MAX_COMMENT_LENGTH}
        </Text>
      </View>

      <View className="mt-3 flex-row gap-2">
        {onCancel ? (
          <Pressable
            onPress={onCancel}
            disabled={submitting}
            accessibilityRole="button"
            className="flex-1 items-center rounded-xl border border-glass-border bg-glass py-3 active:opacity-70">
            <Text className="text-sm font-semibold text-text-secondary">Avbryt</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={handleSubmit}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          className="flex-1 items-center rounded-xl bg-blood-600 py-3 active:opacity-80"
          style={{ opacity: isUnchanged ? 0.5 : 1 }}>
          {submitting ? (
            <ActivityIndicator color={colors.text.onRed} />
          ) : (
            <Text className="text-sm font-bold text-white">{submitLabel}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
