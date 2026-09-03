import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ballColor } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import { ALL_NUMBERS } from "../lotto/generator";

interface NumberGridProps {
  selected: Set<number>;
  onToggle: (n: number) => void;
  maxSelect?: number;
}

export default function NumberGrid({ selected, onToggle, maxSelect = 6 }: NumberGridProps) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.grid}>
      {ALL_NUMBERS.map((n) => {
        const isSelected = selected.has(n);
        const disabled = !isSelected && selected.size >= maxSelect;
        const { bg, fg } = ballColor(n);
        return (
          <TouchableOpacity
            key={n}
            disabled={disabled}
            onPress={() => onToggle(n)}
            style={[
              styles.cell,
              {
                backgroundColor: isSelected ? bg : palette.neutralUnselectedBg,
                borderColor: isSelected ? bg : "transparent",
                opacity: disabled ? 0.4 : 1,
              },
            ]}
          >
            <Text
              style={{
                color: isSelected ? fg : palette.neutralUnselectedFg,
                fontWeight: isSelected ? "700" : "500",
                fontSize: 13,
              }}
            >
              {n}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    margin: 3,
  },
});
