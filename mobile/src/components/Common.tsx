import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { palette } = useAppTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function Disclaimer({ text }: { text: string }) {
  const { palette } = useAppTheme();
  return (
    <Text style={[styles.disclaimer, { color: palette.danger }]}>{text}</Text>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { palette } = useAppTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: palette.primary, opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({
  title,
  onPress,
  active,
}: {
  title: string;
  onPress: () => void;
  active?: boolean;
}) {
  const { palette } = useAppTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.secondaryButton,
        {
          borderColor: palette.primary,
          backgroundColor: active ? palette.primary : "transparent",
        },
      ]}
    >
      <Text style={{ color: active ? "#fff" : palette.primary, fontWeight: "600" }}>{title}</Text>
    </TouchableOpacity>
  );
}

export function StatusText({ text }: { text: string }) {
  const { palette } = useAppTheme();
  if (!text) return null;
  return <Text style={{ color: palette.textMuted, marginVertical: 6 }}>{text}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  disclaimer: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    marginRight: 8,
    marginBottom: 8,
  },
});
