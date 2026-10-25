// Grundidén i hela filen:
// Det finns EN siffra som styr allt: activeIndex. Den säger vilket kort som är i mitten.
// Den är INTE ett heltal hela tiden – när man drar kan den vara t.ex. 2.37, alltså
// lite mer än en tredjedel på väg från kort 2 till kort 3. Varje kort och varje prick
// kollar själv hur långt bort den är från activeIndex och räknar ut sin egen
// rotation/storlek/opacitet utifrån det. Så jag flyttar aldrig korten direkt, jag
// ändrar bara activeIndex och så hänger allt allt annat med av sig självt.
// activeIndex är en shared value (Reanimated). Det betyder att den lever på UI-tråden
// och kan ändras 60–120 gånger per sekund utan att React behöver rendera om.
// Om jag hade använt useState istället hade hela komponenten renderats om.

import { View, Image, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
// scheduleOnRN behövs för att kunna anropa vanlig JS typ en navigate-funktion inifrån
// en gesture. Gesture-callbacks körs på UI-tråden och där kan man inte bara anropa
// vanliga funktioner rakt av, de måste "skickas över" till JS-tråden. Det här är
// Reanimated 4-versionen av det som förut hette runOnJS.
import { scheduleOnRN } from 'react-native-worklets';
import { imageUrl } from 'services/externalApi';

// Kortets storlek i pixlar. Satt som konstanter för att det behövs i uträkning av överlapp
const CARD_WIDTH = 160;
const CARD_HEIGHT = 240;
// Hur mycket luft det ska vara mellan solfjädern och skärmkanten på varje sida.
const SIDE_SPACING = 16;
// Samma fjäderinställningar överallt så att allt studsar likadant.
// damping hur snabbt den slutar gunga högre är mindre studs
// stiffness är hur hårt den drar mot målet högre betyder snabbare
const SPRING_CONFIG = { damping: 15, stiffness: 120 };
// Används när man släpper efter en svepning. Typ om fingret fortsatt i samma fart
// i 0.2 sekunder till var hade vi hamnat? Högre siffra = en svepning kastar längre.
const VELOCITY_SWIPE = 0.2;

// Ett enskilt filmkort
function CardItem({ item, index, activeIndex, overlap, onPress }) {
  // useAnimatedStyle körs på UI-tråden varje gång activeIndex ändras.
  const animatedStyle = useAnimatedStyle(() => {
    // offset = hur långt det här kortet är från mitten, och åt vilket håll.
    //  0  = kortet ÄR i mitten
    // -1  = ett steg till vänster
    //  2  = två steg till höger
    // 0.5 = halvvägs (mitt i en dragning)
    const offset = index - activeIndex.value;

    // interpolate värde, [in-punkter], [ut-punkter] mappar om ett tal.
    // Här: offset -2 → -8 grader, -1 → -4 grader, 0 → 0 grader osv.
    // Mellan punkterna räknas det ut linjärt, så offset 0.5 ger 2 grader.
    // Extrapolation.CLAMP = om offset är utanför (t.ex. 3 eller -4) så fastnar den på
    // sista värdet (8 eller -8) istället för att fortsätta luta mer och mer.
    // Vänsterkort lutar åt vänster, högerkort åt höger → det ser ut som en solfjäder.
    const rotate = interpolate(offset, [-2, -1, 0, 1, 2], [-8, -4, 0, 4, 8], Extrapolation.CLAMP);

    // Kort längre ut åker ner lite.
    const translateY = interpolate(
      offset,
      [-2, -1, 0, 1, 2],
      [16, 6, 0, 6, 16],
      Extrapolation.CLAMP
    );

    // Mittenkortet är fullstort, de andra krymper lite. Math.abs för att vänster och
    // höger ska krympa lika mycket, det är bara avståndet som spelar roll här.
    const scale = interpolate(Math.abs(offset), [0, 1, 2], [1, 0.9, 0.8], Extrapolation.CLAMP);

    // Vilket kort som ligger överst. Ju närmare mitten, desto högre zIndex.
    // Avstånd 0 → 10, avstånd 1 → 9, avstånd 2 → 8, avstånd 3 → 7 osv.
    // Math.round för att zIndex måste vara ett heltal. Det gör att korten "byter plats"
    // i höjdled precis när man drar förbi halvvägs, vilket ser naturligt ut.
    //
    // BUGG som var tidigare:  jag använde interpolate med CLAMP ([0,1,2] → [3,2,1]).
    // Då fick kort på avstånd 2 OCH 3 (och 4) samma zIndex = 1. När två kort har samma
    // zIndex bestämmer ordningen i listan vem som hamnar överst det som renderas
    // sist ligger överst. Det blev olika på vänster och höger sida:
    //  - till vänster ligger närmre kort senare i listan hamnar överst rätt
    //  - till höger ligger yttre kort senare i listan hamnar överst FEL,
    //    det yttersta kortet la sig ovanpå kortet innanför
    // Så solfjädern såg olika ut beroende på om man stod på kort med index 1 eller kort 3.
    // Utan clamp får varje avstånd ett eget zIndex och då spelar listordningen ingen roll.
    // (Kort på samma avstånd, t.ex. -1 och +1, har fortfarande samma zIndex, men de
    // krockar aldrig eftersom mittkortet ligger över området där de möts.)
    const zIndex = Math.round(10 - Math.abs(offset));

    return {
      zIndex,
      // Först flyttas kortet ner, sen roteras det, sen skalas.
      transform: [{ translateY }, { rotate: `${rotate}deg` }, { scale }],
    };
  });

  // Det här är ett svart lager OVANPÅ affischen som gör sidokorten mörkare.
  // Först hade jag opacity på korten men man såg svagt igenom dom eftersom de överlappar
  // och det såg skit ut.
  const dimStyle = useAnimatedStyle(() => {
    const distance = Math.abs(index - activeIndex.value);
    return {
      // 0 = inget mörker (mittkortet), 0.5 = halvsvart (längst ut)
      opacity: interpolate(distance, [0, 1, 2], [0, 0.25, 0.5], Extrapolation.CLAMP),
    };
  });

  // Vad som händer när man trycker på ett kort:
  // - trycker man på kortet som redan är i centrum så ska det öppna detalsidan
  // - trycker man på ett kort på sidan snurra fram det till centrum

  // Det här är en Tap-gesture som ligger INUTI pan-gesturen i TrendingFan.
  // Gesture handler löser själv vem som "vinner": rör man fingret mer än lite
  // så misslyckas tappen och pan tar över. Därför kollas success – onEnd
  // anropas även när tappen misslyckade och då ska inget hända.
  const tapGesture = Gesture.Tap().onEnd((_event, success) => {
    if (!success) return;
    // Math.round för att activeIndex kan vara typ 1.9999 när fjädern nästan är klar
    if (Math.round(activeIndex.value) === index) {
      // onPress är en vanlig JS funktion från föräldern så den måste gå via scheduleOnRN
      // kolla kommentaren vid importen. if satsen är för att onPressMovie inte måste skickas in
      if (onPress) scheduleOnRN(onPress, item);
    } else {
      // .set() istället för activeIndex.value = ... för att linten (React Compiler)
      // klagar om man ändrar .value på en prop. Det gör exakt samma sak.
      activeIndex.set(withSpring(index, SPRING_CONFIG));
    }
  });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          // Negativ marginal gör att korten kryper in över varandra. overlap räknas ut
          // längre ner i TrendingFan beroende på hur bred skärmen är
          { width: CARD_WIDTH, height: CARD_HEIGHT, marginHorizontal: -overlap },
          animatedStyle,
        ]}
        // För skärmläsare VoiceOver/TalkBack annars säger den bara bild
        accessibilityRole="button"
        accessibilityLabel={item.title}
        className="overflow-hidden rounded-xl bg-ink-600 shadow-lg shadow-blood-600">
        {/* Vissa filmer har ingen affisch i TMDB då syns bara bakgrundsfärgen */}
        {item.poster_path && (
          <Image
            source={{ uri: imageUrl(item.poster_path, 'w342') }}
            className="h-full w-full rounded-xl"
            resizeMode="cover"
          />
        )}
        {/* Mörkerlagret. absolute inset-0 gör att det täcker hela kortet.
            pointerEvents none så att lagret inte tar trycken istället för kortet */}
        <Animated.View
          pointerEvents="none"
          style={dimStyle}
          className="absolute inset-0 rounded-xl bg-black"
        />
      </Animated.View>
    </GestureDetector>
  );
}

// En prick under solfjädern
function DotItem({ index, activeIndex }) {
  // Samma sak som med korten, pricken kollar hur långt bort den är från activeIndex.
  // Den som är aktiv är helt vit och dom bredvid blir blekare och blekare
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(index - activeIndex.value);

    const opacity = interpolate(distance, [0, 1, 2], [1.0, 0.6, 0.3], Extrapolation.CLAMP);
    return { opacity };
  });

  // Trycker man på en prick hoppar man till det kortet.
  const tapGesture = Gesture.Tap()
    .hitSlop(8)
    .onEnd((_event, success) => {
      if (success) activeIndex.set(withSpring(index, SPRING_CONFIG));
    });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={animatedStyle} className="mx-1 h-3 w-3 rounded-full bg-white" />
    </GestureDetector>
  );
}

// Själva komponenten
// movies är listan från TMDB (getTrendingMovies) men vi tar bara dom 5 första
export default function TrendingFan({ movies, onPressMovie }) {
  const topFive = movies?.slice(0, 5) || [];
  const { width: screenWidth } = useWindowDimensions();

  // step är hur många pixlar av varje kort som syns innan nästa kort börjar.
  // Hela solfjädern blir ett helt kort + (antal kort - 1) * step
  // och det ska bli lika brett som utrymmet vi har alltså available.
  // Löser man ut step får man (available - CARD_WIDTH) / (antal - 1)
  //
  // Math.min(CARD_WIDTH * 0.6, ...) gör att på en jättebred skärm typ en surfplatta så
  // överlappar korten ändå minst 40% annars ser det inte ut som en solfjäder längre.
  const available = screenWidth - SIDE_SPACING * 2;
  const step =
    topFive.length > 1
      ? Math.min(CARD_WIDTH * 0.6, (available - CARD_WIDTH) / (topFive.length - 1))
      : CARD_WIDTH;
  // Delat med 2 för att marginalen läggs på BÅDA sidorna av varje kort
  const overlap = (CARD_WIDTH - step) / 2;

  // Hur långt man måste dra fingret för att flytta ett kort. En fjärdedel av skärmen.
  const dragUnit = screenWidth * 0.25;
  const maxIndex = Math.max(0, topFive.length - 1);

  // Math.min så att det inte blir index 2 om det bara finns typ 2 filmer
  const activeIndex = useSharedValue(Math.min(2, maxIndex));
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    // Pan startar först när fingret har rört sig 10px i sidled
    .activeOffsetX([-10, 10])
    // och ger upp om fingret rör sig 10px upp eller ner först.
    // Utan dom här två raderna tog solfjädern alla drag så man kunde inte scrolla
    // sidan upp och ner om man råkade sätta fingret på korten
    .failOffsetY([-10, 10])
    .onStart(() => {
      startX.value = activeIndex.value;
    })
    .onUpdate((event) => {
      // translationX är hur många pixlar fingret har flyttats sen start, negativt är vänster.
      // Minustecknet är för att drar man åt VÄNSTER ska man komma till kortet till HÖGER
      // alltså högre index, som när man bläddrar i en bok.
      // Delat med dragUnit för att göra om pixlar till antal kort
      const dragOffset = -event.translationX / dragUnit;

      const nextIndex = startX.value + dragOffset;
      // Låser mellan 0 och sista kortet så man inte kan dra förbi kanterna
      activeIndex.value = Math.max(0, Math.min(maxIndex, nextIndex));
    })
    .onEnd((event) => {
      // När man släpper ska vi landa på ett helt kort. Förut avrundade jag bara
      // positionen men då hände inget på en snabb svepning om man inte hunnit dra
      // förbi halvvägs. Nu räknas farten med också.
      //
      // velocityX är pixlar per sekund och delat med dragUnit blir det kort per sekund.
      const indexVelocity = -event.velocityX / dragUnit;

      // Gissar var vi hade hamnat om fingret fortsatt en stund (VELOCITY_SWIPE).
      // Släpper man långsamt är farten nästan 0 så projected blir där man redan är
      // och då blir det bara vanlig avrundning
      const projected = activeIndex.value + indexVelocity * VELOCITY_SWIPE;
      const target = Math.max(0, Math.min(maxIndex, Math.round(projected)));

      // velocity i fjädern gör att den börjar röra sig i samma fart som fingret hade.
      // Utan den stannar allt tvärt och sen börjar fjädern om från 0 vilket känns hackigt
      activeIndex.value = withSpring(target, { ...SPRING_CONFIG, velocity: indexVelocity });
    });

  return (
    <View className="my-6 items-center">
      {/* Pan ligger runt ALLA kort och tap ligger på varje kort inne i CardItem */}
      <GestureDetector gesture={panGesture}>
        <View className="h-52 w-full flex-row items-center justify-center">
          {topFive.map((item, index) => (
            <CardItem
              key={item.id}
              item={item}
              index={index}
              activeIndex={activeIndex}
              overlap={overlap}
              onPress={onPressMovie}
            />
          ))}
        </View>
      </GestureDetector>
      <View className="mt-20 flex-row items-center">
        {topFive.map((item, index) => (
          <DotItem key={`dot-${item.id}`} index={index} activeIndex={activeIndex} />
        ))}
      </View>
    </View>
  );
}
