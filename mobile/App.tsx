import React from "react";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ThemeProvider, useAppTheme } from "./src/theme/ThemeContext";
import Tab1Generate from "./src/screens/Tab1Generate";
import Tab2Autocomplete from "./src/screens/Tab2Autocomplete";
import Tab3Randomness from "./src/screens/Tab3Randomness";
import Tab4Frequency from "./src/screens/Tab4Frequency";
import Tab5RankSimulator from "./src/screens/Tab5RankSimulator";
import Tab6CheckResult from "./src/screens/Tab6CheckResult";
import Tab7AiRecommend from "./src/screens/Tab7AiRecommend";

const Tab = createMaterialTopTabNavigator();

const GLOBAL_DISCLAIMER =
  "본 앱은 실제 당첨을 예측하는 기능이 아니라, 무작위성 학습·데이터 분석·재미를 " +
  "목적으로 합니다. 매크로/자동 구매 기능을 제공하지 않습니다.";

function Header() {
  const insets = useSafeAreaInsets();
  const { palette, isDark, toggleTheme } = useAppTheme();
  return (
    <View
      style={[
        styles.header,
        { backgroundColor: palette.surface, paddingTop: insets.top + 10, borderBottomColor: palette.border },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: palette.text }]}>로또 6/45 분석</Text>
        <Text style={[styles.disclaimer, { color: palette.textMuted }]}>{GLOBAL_DISCLAIMER}</Text>
      </View>
      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.themeButton, { borderColor: palette.primary }]}
      >
        <Text style={{ color: palette.primary, fontWeight: "600" }}>
          {isDark ? "라이트" : "다크"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function MainNavigator() {
  const { palette, isDark } = useAppTheme();
  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <Header />
      <Tab.Navigator
        screenOptions={{
          tabBarScrollEnabled: true,
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.textMuted,
          tabBarIndicatorStyle: { backgroundColor: palette.primary },
          tabBarStyle: { backgroundColor: palette.surface },
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600", textTransform: "none" },
          tabBarItemStyle: { width: "auto", paddingHorizontal: 12 },
        }}
      >
        <Tab.Screen name="번호 생성" component={Tab1Generate} />
        <Tab.Screen name="자동완성" component={Tab2Autocomplete} />
        <Tab.Screen name="무작위성 실험" component={Tab3Randomness} />
        <Tab.Screen name="빈도 분석" component={Tab4Frequency} />
        <Tab.Screen name="등수 시뮬레이터" component={Tab5RankSimulator} />
        <Tab.Screen name="회차 결과 확인" component={Tab6CheckResult} />
        <Tab.Screen name="추천 조합" component={Tab7AiRecommend} />
      </Tab.Navigator>
      <StatusBar style={isDark ? "light" : "dark"} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  disclaimer: {
    fontSize: 11,
    marginTop: 4,
  },
  themeButton: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
});
