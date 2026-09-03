import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";

interface BarChartProps {
  data: Record<number, number>; // 번호(1~45) -> 값
  color: string;
  height?: number;
}

export default function BarChart({ data, color, height = 180 }: BarChartProps) {
  const { palette } = useAppTheme();
  const numbers = Object.keys(data)
    .map(Number)
    .sort((a, b) => a - b);
  const maxVal = Math.max(1, ...numbers.map((n) => data[n]));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.chartArea, { height }]}>
        {numbers.map((n) => {
          const val = data[n];
          const barHeight = Math.max(2, (val / maxVal) * (height - 24));
          return (
            <View key={n} style={styles.barWrap}>
              <Text style={[styles.valueLabel, { color: palette.textMuted }]}>{val}</Text>
              <View style={[styles.bar, { height: barHeight, backgroundColor: color }]} />
              <Text style={[styles.numLabel, { color: palette.textMuted }]}>{n}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 4,
  },
  barWrap: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: 16,
    marginHorizontal: 1,
  },
  bar: {
    width: 10,
    borderRadius: 2,
  },
  numLabel: {
    fontSize: 8,
    marginTop: 2,
  },
  valueLabel: {
    fontSize: 8,
    marginBottom: 2,
  },
});
