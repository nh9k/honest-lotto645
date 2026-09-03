import React, { useState } from "react";
import { Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import { ScreenTitle, PrimaryButton, Disclaimer } from "../components/Common";
import BallRow from "../components/BallRow";
import NumberGrid from "../components/NumberGrid";
import { generateDraw, DrawResult } from "../lotto/generator";
import { judgeRank, rankLabel } from "../lotto/rank";
import { useAppTheme } from "../theme/ThemeContext";

export default function Tab5RankSimulator() {
  const { palette } = useAppTheme();
  const [draw, setDraw] = useState<DrawResult>(() => generateDraw());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);

  const toggle = (n: number) => {
    setChecked(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < 6) next.add(n);
      return next;
    });
  };

  const redraw = () => {
    setDraw(generateDraw());
    setSelected(new Set());
    setChecked(false);
  };

  const myNumbers = [...selected];
  const matchSet = checked
    ? new Set(draw.winNumbers.filter((n) => myNumbers.includes(n)))
    : new Set<number>();
  const finalRank = checked ? judgeRank(myNumbers, draw.winNumbers, draw.bonus) : null;

  return (
    <ScreenContainer>
      <ScreenTitle title="등수 시뮬레이터" />
      <Disclaimer text="실제 추첨 결과는 예측할 수 없으며, 등수별 당첨 조건을 체험하기 위한 시뮬레이션입니다." />

      <PrimaryButton title="당첨번호 재추첨" onPress={redraw} />

      <Text style={{ color: palette.text, marginTop: 16, marginBottom: 6 }}>내 번호 6개 선택</Text>
      <NumberGrid selected={selected} onToggle={toggle} maxSelect={6} />

      <View style={{ marginTop: 16, marginBottom: 8 }}>
        <PrimaryButton
          title="결과 확인"
          onPress={() => setChecked(true)}
          disabled={selected.size !== 6}
        />
      </View>

      {checked && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ color: palette.textMuted, marginBottom: 4 }}>당첨번호</Text>
          <BallRow numbers={draw.winNumbers} bonus={draw.bonus} matchSet={matchSet} />

          <Text style={{ color: palette.textMuted, marginTop: 16, marginBottom: 4 }}>내 번호</Text>
          <BallRow numbers={myNumbers} matchSet={matchSet} />

          <Text style={{ color: "#2FA84F", fontWeight: "700", fontSize: 18, marginTop: 16 }}>
            {rankLabel(finalRank)}입니다
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
