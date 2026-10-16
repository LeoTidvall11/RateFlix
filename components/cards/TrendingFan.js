import { View, Image } from 'react-native';
import { imageUrl } from 'services/externalApi';

export default function TrendingFan({ movies }) {
  const topFive = movies?.slice(0, 5) || [];

  const cardStyles = [
    { rotate: '-8deg', translateY: 16, zIndex: 1 },
    { rotate: '-4deg', translateY: 6, zIndex: 2 },
    { rotate: '0deg', translateY: 0, zIndex: 3 },
    { rotate: '4deg', translateY: 6, zIndex: 2 },
    { rotate: '8deg', translateY: 16, zIndex: 1 },
  ];

  const dotOpacities = ['opacity-30', 'opacity-60', 'opacity-100', 'opacity-60', 'opacity-30'];

  return (
    <View className="mx-6 my-6 items-center">
      <View className="h-52 w-full flex-row items-center justify-center px-4">
        {topFive.map((item, index) => {
          const style = cardStyles[index] || {};

          return (
            <View
              key={item.id}
              style={{
                zIndex: style.zIndex,
                transform: [{ rotate: style.rotate }, { translateY: style.translateY }],
              }}
              className="-mx-12 overflow-hidden rounded-xl bg-ink-600 shadow-lg shadow-blood-600">
              {item.poster_path && (
                <Image
                  source={{ uri: imageUrl(item.poster_path, 'w342') }}
                  className="h-60 w-40 rounded-xl"
                  resizeMode="cover"
                />
              )}
            </View>
          );
        })}
      </View>
      <View className="mt-10 flex-row items-center  ">
        {topFive.map((item, index) => (
          <View
            key={`dot-${item.id}`}
            className={`mx-1 h-3 w-3  rounded-full bg-white ${dotOpacities[index]} `}
          />
        ))}
      </View>
    </View>
  );
}
