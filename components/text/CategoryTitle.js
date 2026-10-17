import { View, Text } from 'react-native';

export default function CategoryTitle({ title }) {
  return (
    <View className="mb-3 flex-row items-center gap-3">
      <View className="h-6 w-1 rounded-full bg-blood-600" />
      <View>
        <Text className="text-xl font-extrabold tracking-wide text-text-primary">{title}</Text>
      </View>
    </View>
  );
}
