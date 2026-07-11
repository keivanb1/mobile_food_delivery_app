import { router } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

const SignUp = () => {
  return (
    <View>
      <Text>SignUp</Text>
      <Button title="signin" onPress={() => router.push("/sign-in")} />
    </View>
  );
};

export default SignUp;
