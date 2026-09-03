import React from "react";
import { StyleSheet, Text, View } from "react-native";
import LottoBall from "./LottoBall";
import {
  AUTO_PICK_RING_COLOR,
  BONUS_RING_COLOR,
  MATCH_RING_COLOR,
  USER_PICK_RING_COLOR,
} from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";

interface BallRowProps {
  numbers: number[];
  bonus?: number;
  matchSet?: Set<number>;
  userPicked?: Set<number>;
  autoPicked?: Set<number>;
}

export default function BallRow({
  numbers,
  bonus,
  matchSet,
  userPicked,
  autoPicked,
}: BallRowProps) {
  const { palette } = useAppTheme();

  const ringFor = (n: number): string | undefined => {
    if (matchSet?.has(n)) return MATCH_RING_COLOR;
    if (userPicked?.has(n)) return USER_PICK_RING_COLOR;
    if (autoPicked?.has(n)) return AUTO_PICK_RING_COLOR;
    return undefined;
  };

  return (
    <View style={styles.row}>
      {numbers.map((n) => (
        <LottoBall key={n} number={n} ringColor={ringFor(n)} />
      ))}
      {bonus !== undefined && (
        <>
          <Text style={[styles.plus, { color: palette.text }]}>+</Text>
          <LottoBall
            number={bonus}
            ringColor={matchSet?.has(bonus) ? MATCH_RING_COLOR : BONUS_RING_COLOR}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  plus: {
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 6,
  },
});
