import CartButton from "@/components/CartButton";
import { images, offers } from "@/constants";
import cn from "clsx";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        showsVerticalScrollIndicator={false}
        data={offers}
        renderItem={({ item, index }) => {
          const isEven = index % 2 === 0;
          return (
            <View>
              <Pressable
                className={cn(
                  "offer-card",
                  isEven ? "flex-row-reverse" : "flex-row",
                )}
                style={{ backgroundColor: item.color }}
                android_ripple={{ color: "#ffff22" }}
              >
                {() => (
                  <>
                    <View className="h-full w-1/2">
                      <Image
                        source={item.image}
                        className="size-full"
                        resizeMode="contain"
                      />
                    </View>
                    <View
                      className={cn(
                        "offer-card__info",
                        isEven ? "pl-10" : "pr-10",
                      )}
                    >
                      <Text className="h1-bold text-white leading-tight">
                        {item.title}
                      </Text>
                      <Image
                        source={images.arrowRight}
                        className="size-10"
                        resizeMode="contain"
                        tintColor="#ffffff"
                      />
                    </View>
                  </>
                )}
              </Pressable>
            </View>
          );
        }}
        contentContainerClassName="pb-28 px-5"
        ListHeaderComponent={
          <View className="flex flex-row items-center justify-between my-5">
            <View className="flex flex-col items-start">
              <Text className="text-primary font-bold font-quicksand-bold ">
                Deliver to
              </Text>
              <TouchableOpacity className="flex flex-row items-center gap-x-1 mt-0.5">
                <Text className="text-black font-bold font-quicksand-semibold ">
                  keyvan bayat
                </Text>
                <Image
                  source={images.arrowDown}
                  className="size-3"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <CartButton />
          </View>
        }
      />
    </SafeAreaView>
  );
}
