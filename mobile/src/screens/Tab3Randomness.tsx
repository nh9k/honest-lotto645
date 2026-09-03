import React, { useState } from "react";
import { Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import ScreenContainer from "../components/ScreenContainer";
import { ScreenTitle, PrimaryButton, StatusText } from "../components/Common";
import BarChart from "../components/BarChart";
import { simulateFrequency } from "../lotto/generator";
import { useAppTheme } from "../theme/ThemeContext";

const DRAW_OPTIONS = [100, 1_000, 10_000, 100_000];

export default function Tab3Randomness() {
  const { palette } = useAppTheme();
  const [optionIdx, setOptionIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [counter, setCounter] = useState<Record<number, number> | null>(null);

  const run = () => {
    setRunning(true);
    setCounter(null);
    // 다음 프레임에 실행해 "실행 중" 상태가 먼저 화면에 반영되도록 함
    setTimeout(() => {
      const result = simulateFrequency(DRAW_OPTIONS[optionIdx]);
      setCounter(result);
      setRunning(false);
    }, 30);
  };

  return (
    <ScreenContainer>
      <ScreenTitle
        title="무작위성 실험"
        subtitle="가상 추첨을 여러 번 반복해 번호별 등장 빈도를 확인합니다."
      />

      <Text style={{ color: palette.text, marginBottom: 4 }}>
        추첨 횟수: {DRAW_OPTIONS[optionIdx].toLocaleString()}회
      </Text>
      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={0}
        maximumValue={DRAW_OPTIONS.length - 1}
        step={1}
        value={optionIdx}
        onValueChange={(v) => setOptionIdx(Math.round(v))}
        minimumTrackTintColor={palette.primary}
      />

      <View style={{ marginTop: 8, marginBottom: 16 }}>
        <PrimaryButton title="시뮬레이션 실행" onPress={run} disabled={running} />
      </View>

      <StatusText text={running ? "계산 중..." : ""} />

      {counter && (
        <>
          <BarChart data={counter} color={palette.primary} />
          <Text style={{ color: palette.textMuted, marginTop: 16, lineHeight: 20 }}>
            추첨 횟수를 늘려도 특정 번호가 계속 우세해지지 않는다 = 매회 독립적인 무작위 추첨
          </Text>
        </>
      )}
    </ScreenContainer>
  );
}
