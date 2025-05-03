import React from "react";
import { Tabs, useRouter } from "expo-router";
import { Image, View, StyleSheet, TouchableOpacity } from "react-native";
import { icons } from "@/constants";

const COLORS = {
  active: "#006A71",
  inactive: "#9CA3AF",
  background: "#FFFFFF",
  ripple: "rgba(72, 166, 167, 0.15)", // light teal background on active icon
  floating: "#48A6A7",
};

const TabIcon = ({ source, focused }: { source: any; focused: boolean }) => (
  <View style={styles.tabItem}>
    <View
      style={[
        styles.iconWrapper,
        { backgroundColor: focused ? COLORS.ripple : "transparent" },
      ]}
    >
      <Image
        source={source}
        style={[
          styles.icon,
          { tintColor: focused ? COLORS.active : COLORS.inactive },
        ]}
        resizeMode="contain"
      />
    </View>
  </View>
);

export default function Layout() {
  const router = useRouter();

  return (
    <>
      <Tabs
        initialRouteName="home"
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBarStyle,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} source={icons.home} />
            ),
          }}
        />
        <Tabs.Screen
          name="graph"
          options={{
            title: "Graph",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} source={icons.graph} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} source={icons.chat} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} source={icons.profile} />
            ),
          }}
        />
      </Tabs>

      {/* Floating Insights Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/(chat)/insights")}
      >
        <Image source={icons.bot} style={styles.floatingIcon} />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: COLORS.background,
    height: 60,
    borderTopWidth: 0.6,
    borderTopColor: "#D1D5DB",
    position: "absolute",
    bottom: 0,
    width: "100%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginBottom: -20,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 26,
    height: 26,
  },
  floatingButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 58,
    height: 58,
    backgroundColor: COLORS.floating,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  floatingIcon: {
    width: 28,
    height: 28,
    tintColor: "#FFFFFF",
  },
});
