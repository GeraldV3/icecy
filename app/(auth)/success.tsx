import { useRouter, Href } from "expo-router";
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@components/CustomButton";

const SuccessScreen: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)/home" as Href);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.congratulationsText}>Congratulations!</Text>
        <Text style={styles.subText}>
          You are now signed in. Redirecting you to the home screen.
        </Text>

        <CustomButton
          title="Continue to Home"
          onPress={() => router.replace("/(tabs)/home" as Href)}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EFE7", // ✅ matched your app's consistent light background
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  congratulationsText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#006A71", // ✅ your teal color
    marginBottom: 12,
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#006A71", // Dark teal
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
  },
});

export default SuccessScreen;
