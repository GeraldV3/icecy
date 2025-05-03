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

const COLORS = {
  background: "#F2EFE7",
  title: "#006A71",
  subtitle: "#9ACBD0",
  buttonPrimary: "#48A6A7",
  modalOverlay: "rgba(0,0,0,0.5)",
  modalBackground: "#FFFFFF",
};

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
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Header */}
      <View className="mt-8 px-6">
        <Text
          className="text-2xl font-bold text-center"
          style={{ color: COLORS.title }}
          accessibilityRole="header"
        >
          Welcome to Project EYES!
        </Text>
        <Text
          className="text-base mt-2 text-center"
          style={{ color: COLORS.subtitle }}
          accessibilityRole="text"
        >
          Click a button below to get started.
        </Text>
      </View>

      {/* Floating Image */}
      <Animated.View
        className="items-center justify-center mt-10"
        style={{ transform: [{ translateY: floatAnim }] }}
      >
        <Image
          source={images.startBg}
          className="w-50 h-110 mt-15"
          resizeMode="contain"
          accessibilityLabel="Floating image of a robot or illustration"
        />
      </Animated.View>

      {/* Action Buttons */}
      <View className="flex-row space-x-4 mt-20 px-6 justify-center items-center">
        <CustomButton
          title="Sign In"
          onPress={() => router.replace("/(auth)/sign-in" as Href)}
          className="w-[140px]"
          style={{ backgroundColor: COLORS.buttonPrimary }}
          accessibilityLabel="Sign in to your account"
        />
        <CustomButton
          title="Sign Up"
          onPress={() => setIsModalVisible(true)}
          className="w-[140px]"
          style={{ backgroundColor: COLORS.subtitle }}
          accessibilityLabel="Sign up for a new account"
        />
      </View>

      {/* Role Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: COLORS.modalOverlay }}
        >
          <View
            className="w-4/5 rounded-lg p-6"
            style={{ backgroundColor: COLORS.modalBackground }}
          >
            <Text
              className="text-lg font-bold text-center mb-4"
              style={{ color: COLORS.title }}
              accessibilityRole="header"
            >
              Select Your Role
            </Text>

            <CustomButton
              title="Teacher"
              onPress={() => {
                setIsModalVisible(false);
                router.replace("/(auth)/sign-up-teacher" as Href);
              }}
              className="w-full py-3 mb-4 rounded-lg"
              style={{ backgroundColor: COLORS.buttonPrimary }}
              accessibilityLabel="Register as a teacher"
            />

            <CustomButton
              title="Parent"
              onPress={() => {
                setIsModalVisible(false);
                router.replace("/(auth)/sign-up" as Href);
              }}
              className="w-full py-3 rounded-lg"
              style={{ backgroundColor: COLORS.buttonPrimary }}
              accessibilityLabel="Register as a parent"
            />

            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Cancel role selection"
            >
              <Text
                className="text-center underline mt-4"
                style={{ color: COLORS.title }}
              >
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
