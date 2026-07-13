import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { createUser } from "@/lib/appwrite";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  });
  const submit = async () => {
    const { email, password, name } = form;
    if (!email || !password || !name)
      return Alert.alert(
        "Error",
        "Please enter valid name & email address & password",
      );

    setIsSubmitting(true);

    try {
      await createUser({
        email: email,
        password: password,
        name: name,
      });
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Enter your full name"
        value={form.name}
        onChangeText={(name) => setForm((prev) => ({ ...prev, name }))}
        label="Full Name"
      />
      <CustomInput
        placeholder="Enter your Email"
        value={form.email}
        onChangeText={(email) => setForm((prev) => ({ ...prev, email }))}
        label="Email Address"
        keyboardType="email-address"
      />
      <CustomInput
        placeholder="Enter your Password"
        value={form.password}
        onChangeText={(password) => setForm((prev) => ({ ...prev, password }))}
        label="Password"
        secureTextEntry={true}
      />
      <CustomButton title="Sign Up" onPress={submit} isLoading={isSubmitting} />

      <View className="flex flex-row gap-2 items-center justify-center mt-3">
        <Text className="base-regular text-gray-100">
          Already have an account?
        </Text>
        <Link className="base-bold text-primary" href="/sign-in">
          Sign In
        </Link>
      </View>
    </View>
  );
};

export default SignUp;
