import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";

export default function ScreenContainer({ children }: { children: React.ReactNode }) {
  const { palette } = useAppTheme();
  return (
    <ScrollView
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.content}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
