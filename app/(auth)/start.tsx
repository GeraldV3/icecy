import { useRouter, Href } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  View,
  Text,
  Easing,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@components/CustomButton";
import { images } from "@/constants";

const Start: React.FC = () => {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Animated value for floating effect
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 10,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    animate();
  }, [floatAnim]);

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: "#F2EFE7" }}
    >
      {/* Header Section */}
      <View className="mt-8">
        <Text className="text-2xl font-bold text-[#006A71] text-center">
          Welcome to Project EYES!
        </Text>
        <Text className="text-base text-[#9ACBD0] mt-2 text-center">
          Click a button below to get started.
        </Text>
      </View>

      {/* Image Section with Floating Animation */}
      <Animated.View
        className="items-center justify-center mt-10"
        style={{ transform: [{ translateY: floatAnim }] }}
      >
        <Image
          source={images.startBg}
          className="w-50 h-110 mt-15"
          resizeMode="contain"
        />
      </Animated.View>

      {/* Button Section */}
      <View className="flex-row space-x-4 mt-20 justify-center items-center">
        <CustomButton
          title="Sign In"
          onPress={() => router.replace("/(auth)/sign-in" as Href)}
          className="w-[140px]"
          style={{ backgroundColor: "#48A6A7" }}
        />
        <CustomButton
          title="Sign Up"
          onPress={() => setIsModalVisible(true)}
          className="w-[140px]"
          style={{ backgroundColor: "#9ACBD0" }}
        />
      </View>

      {/* Modal for Role Selection */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-4/5 bg-white rounded-lg p-6">
            <Text className="text-lg font-bold text-[#006A71] text-center mb-4">
              Select Your Role
            </Text>

            <CustomButton
              title="Teacher"
              onPress={() => {
                setIsModalVisible(false);
                router.replace("/(auth)/sign-up-teacher" as Href);
              }}
              className="w-full py-3 mb-4 rounded-lg"
              style={{ backgroundColor: "#48A6A7" }}
            />
            <CustomButton
              title="Parent"
              onPress={() => {
                setIsModalVisible(false);
                router.replace("/(auth)/sign-up" as Href);
              }}
              className="w-full py-3 rounded-lg"
              style={{ backgroundColor: "#48A6A7" }}
            />

            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text className="text-center text-[#006A71] underline mt-4">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Start;
