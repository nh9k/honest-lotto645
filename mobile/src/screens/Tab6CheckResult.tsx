import React, { useState } from "react";
import { Text, TextInput, View, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import { ScreenTitle, PrimaryButton, StatusText } from "../components/Common";
import BallRow from "../components/BallRow";
import NumberGrid from "../components/NumberGrid";
import { DrawResult, estimateLatestRound, fetchDraw } from "../lotto/api";
import { judgeRank, rankLabel } from "../lotto/rank";
import { useAppTheme } from "../theme/ThemeContext";

export default function Tab6CheckResult() {
  const { palette } = useAppTheme();
  const latest = estimateLatestRound();
  const [roundText, setRoundText] = useState(String(latest));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [draw, setDraw] = useState<DrawResult | null>(null);

  const toggle = (n: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < 6) next.add(n);
      return next;
    });
  };

  const check = async () => {
    const roundNo = parseInt(roundText, 10);
    if (selected.size !== 6 || !roundNo) return;
    setLoading(true);
    setStatus("조회 중...");
    setDraw(null);
    const result = await fetchDraw(roundNo);
    setLoading(false);
    if (!result) {
      setStatus("아직 추첨되지 않은 회차이거나 조회에 실패했습니다.");
      return;
    }
    setStatus(`${roundNo}회 (${result.date}) 결과`);
    setDraw(result);
  };

  const myNumbers = [...selected];
  const matchSet = draw
    ? new Set(draw.numbers.filter((n) => myNumbers.includes(n)))
    : new Set<number>();
  const finalRank = draw ? judgeRank(myNumbers, draw.numbers, draw.bonus) : null;

  return (
    <ScreenContainer>
      <ScreenTitle
        title="회차 결과 확인"
        subtitle="원하는 회차의 실제 당첨번호와 내가 고른 번호를 비교합니다."
      />

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ color: palette.text, marginRight: 6 }}>회차 선택</Text>
        <TextInput
          value={roundText}
          onChangeText={setRoundText}
          keyboardType="number-pad"
          style={[styles.input, { color: palette.text, borderColor: palette.border }]}
        />
      </View>

      <Text style={{ color: palette.text, marginBottom: 6 }}>내 번호 6개 선택</Text>
      <NumberGrid selected={selected} onToggle={toggle} maxSelect={6} />

      <View style={{ marginTop: 16, marginBottom: 8 }}>
        <PrimaryButton title="결과 확인" onPress={check} disabled={selected.size !== 6 || loading} />
      </View>

      <StatusText text={status} />

      {draw && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: palette.textMuted, marginBottom: 4 }}>당첨번호</Text>
          <BallRow numbers={draw.numbers} bonus={draw.bonus} matchSet={matchSet} />

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

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 90,
  },
});
