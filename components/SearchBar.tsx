import { images } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, TextInput, TouchableOpacity, View } from "react-native";

const SearchBar = () => {
  const params = useLocalSearchParams<{ query?: string }>();
  const [query, setQuery] = useState(params.query);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (!text) router.setParams({ query: undefined });
  };

  const handleSubmit = () => {
    if (query?.trim()) router.setParams({ query });
  };

  return (
    <View className="searchbar">
      <TextInput
        className="flex-1 p-5"
        placeholder="search for pizzas, burgers, ..."
        value={query}
        placeholderTextColor="#a0a0a0"
        onChangeText={handleSearch}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
      />
      <TouchableOpacity
        className="pr-5 "
        onPress={() => router.setParams({ query })}
      >
        <Image
          source={images.search}
          className="size-5"
          resizeMode="contain"
          tintColor="#5d5f6d"
        />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
