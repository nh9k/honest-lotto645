import React, { useState } from "react";
import { View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import { ScreenTitle, PrimaryButton, SecondaryButton, StatusText } from "../components/Common";
import BallRow from "../components/BallRow";
import NumberGrid from "../components/NumberGrid";
import { autocomplete } from "../lotto/generator";
import { useAppTheme } from "../theme/ThemeContext";
import { Text } from "react-native";

export default function Tab2Autocomplete() {
  const { palette } = useAppTheme();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<number[] | null>(null);
  const [autoPicked, setAutoPicked] = useState<Set<number>>(new Set());

  const toggle = (n: number) => {
    setResult(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < 6) next.add(n);
      return next;
    });
  };

  const recommend = () => {
    if (selected.size === 0 || selected.size >= 6) return;
    const full = autocomplete([...selected]);
    setAutoPicked(new Set(full.filter((n) => !selected.has(n))));
    setResult(full);
  };

  const reset = () => {
    setSelected(new Set());
    setResult(null);
    setAutoPicked(new Set());
  };

  let status = "1~5개의 번호를 선택해주세요.";
  if (selected.size >= 6) status = "이미 6개를 모두 선택하셨어요.";
  else if (selected.size > 0) status = `${selected.size}개 선택됨`;

  return (
    <ScreenContainer>
      <ScreenTitle
        title="번호 자동완성"
        subtitle="원하는 번호를 1~5개 직접 선택하면, 나머지를 무작위로 채워 6개를 완성합니다."
      />

      <NumberGrid selected={selected} onToggle={toggle} maxSelect={6} />

      <View style={{ flexDirection: "row", marginTop: 16, marginBottom: 8 }}>
        <View style={{ marginRight: 8 }}>
          <PrimaryButton
            title="나머지 추천받기"
            onPress={recommend}
            disabled={selected.size === 0 || selected.size >= 6}
          />
        </View>
        <SecondaryButton title="초기화" onPress={reset} />
      </View>

      <StatusText text={status} />
      <Text style={{ color: palette.textMuted, marginBottom: 12 }}>
        파란 테두리 = 직접 선택 | 초록 테두리 = 자동완성
      </Text>

      {result && (
        <BallRow numbers={result} userPicked={selected} autoPicked={autoPicked} />
      )}
    </ScreenContainer>
  );
}
