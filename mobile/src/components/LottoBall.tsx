import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ballColor } from "../theme/colors";

interface LottoBallProps {
  number: number;
  size?: number;
  ringColor?: string;
}

export default function LottoBall({ number, size = 38, ringColor }: LottoBallProps) {
  const { bg, fg } = ballColor(number);
  return (
    <View
      style={[
        styles.ring,
        {
          width: size + 6,
          height: size + 6,
          borderRadius: (size + 6) / 2,
          borderColor: ringColor ?? "transparent",
          borderWidth: ringColor ? 3 : 0,
        },
      ]}
    >
      <View
        style={[
          styles.ball,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        ]}
      >
        <Text style={[styles.text, { color: fg, fontSize: size * 0.38 }]}>{number}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
  },
  ball: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "700",
  },
});
