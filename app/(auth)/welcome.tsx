import { useRouter, Href } from "expo-router";
import { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import CustomButton from "@components/CustomButton";
import { onboarding } from "@/constants";

const Home = () => {
  const router = useRouter();
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView
      className="flex h-full items-center justify-between"
      style={{ backgroundColor: "#F2EFE7" }}
    >
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/start" as Href);
        }}
        className="w-full flex justify-end items-end p-5"
      >
        <Text className="text-[#006A71] text-md font-JakartaBold">Skip</Text>
      </TouchableOpacity>

      <Swiper
        ref={swiperRef}
        loop={false}
        dot={
          <View
            className="w-[32px] h-[4px] mx-1"
            style={{ backgroundColor: "#9ACBD0" }}
          />
        }
        activeDot={
          <View
            className="w-[32px] h-[4px] mx-1"
            style={{ backgroundColor: "#006A71" }}
          />
        }
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboarding.map((item) => (
          <View key={item.id} className="flex items-center justify-center p-5">
            <Image
              source={item.image}
              className="w-full h-[300px]"
              resizeMode="contain"
            />
            <View className="flex flex-row items-center justify-center w-full mt-10">
              <Text className="text-[#006A71] text-3xl font-bold mx-13 text-center">
                {item.title}
              </Text>
            </View>
            <Text className="text-md font-JakartaSemiBold text-center text-[#858585] mx-12 mt-3">
              {item.description}
            </Text>
          </View>
        ))}
      </Swiper>

      <CustomButton
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={() =>
          isLastSlide
            ? router.replace("/(auth)/start" as Href)
            : swiperRef.current?.scrollBy(1)
        }
        className="w-11/12 mt-10 mb-5"
        style={{ backgroundColor: "#48A6A7" }}
      />
    </SafeAreaView>
  );
};

export default Home;
