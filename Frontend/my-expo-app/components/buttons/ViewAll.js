import { Pressable, Text } from 'react-native';
export default function ViewAll() {
  return (
    <Pressable className="m-2 my-4 items-center rounded-full bg-blood-700 p-4 ">
      <Text className="font-bold uppercase tracking-wider text-text-onRed">View all!</Text>
    </Pressable>
  );
}
