import { Slot } from "expo-router";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const _layout = () => {
  return (
    <SafeAreaView>
      <Text>auth layout</Text>
      <Slot />
    </SafeAreaView>
  );
};

export default _layout;
