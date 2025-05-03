import { useRouter, Href } from "expo-router";
import { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import CustomButton from "@components/CustomButton";
import { onboarding } from "@/constants";

// 🔹 Centralized Color Theme
const COLORS = {
  background: "#F2EFE7",
  title: "#006A71",
  subtitle: "#858585",
  button: "#48A6A7",
  dotInactive: "#9ACBD0",
  dotActive: "#006A71",
};

const Home = () => {
  const router = useRouter();
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === onboarding.length - 1;

  const renderSlides = () =>
    onboarding.map((item) => (
      <View
        key={item.id}
        className="flex items-center justify-center px-6 py-4"
        accessible
        accessibilityRole="summary"
      >
        <Image
          source={item.image}
          className="w-full h-[300px]"
          resizeMode="contain"
          accessibilityLabel={item.title}
        />
        <View className="w-full mt-10">
          <Text
            className="text-3xl font-bold text-center"
            style={{ color: COLORS.title }}
            accessibilityRole="header"
          >
            {item.title}
          </Text>
        </View>
        <Text
          className="text-md font-JakartaSemiBold text-center mt-3"
          style={{ color: COLORS.subtitle }}
          accessibilityRole="text"
        >
          {item.description}
        </Text>
      </View>
    ));

  return (
    <SafeAreaView
      className="flex h-full items-center justify-between"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Skip Button */}
      <TouchableOpacity
        accessible
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding"
        onPress={() => router.replace("/(auth)/start" as Href)}
        className="w-full flex justify-end items-end p-5"
      >
        <Text
          className="text-md font-JakartaBold"
          style={{ color: COLORS.title }}
        >
          Skip
        </Text>
      </TouchableOpacity>

      {/* Swiper Slides */}
      <Swiper
        ref={swiperRef}
        loop={false}
        dot={
          <View
            className="w-[32px] h-[4px] mx-1 rounded-full"
            style={{ backgroundColor: COLORS.dotInactive }}
          />
        }
        activeDot={
          <View
            className="w-[32px] h-[4px] mx-1 rounded-full"
            style={{ backgroundColor: COLORS.dotActive }}
          />
        }
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {renderSlides()}
      </Swiper>

      {/* CTA Button */}
      <CustomButton
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={() =>
          isLastSlide
            ? router.replace("/(auth)/start" as Href)
            : swiperRef.current?.scrollBy?.(1)
        }
        className="w-11/12 mt-10 mb-5"
        style={{ backgroundColor: COLORS.button }}
        accessibilityLabel={isLastSlide ? "Start the app" : "Next slide"}
        accessibilityRole="button"
      />
    </SafeAreaView>
  );
};

export default Home;
