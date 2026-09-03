import React, { useState } from "react";
import { View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import { ScreenTitle, PrimaryButton, SecondaryButton, StatusText, Disclaimer } from "../components/Common";
import BallRow from "../components/BallRow";
import { estimateLatestRound, fetchDrawsRange } from "../lotto/api";
import { generateAiRecommend } from "../lotto/generator";

const N_OPTIONS = [20, 50, 100];

const DISCLAIMER =
  "이 조합은 무작위 생성 규칙에 따른 것으로, 실제 당첨 확률을 높이지 않습니다.\n" +
  "로또는 매회 독립적인 무작위 추첨이며, 어떤 방법으로도 다음 회차를 예측할 수 없습니다.";

export default function Tab7AiRecommend() {
  const [n, setN] = useState(N_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [numbers, setNumbers] = useState<number[] | null>(null);

  const generate = async () => {
    setLoading(true);
    setStatus("최근 데이터 조회 중...");
    setNumbers(null);

    const latest = estimateLatestRound();
    const start = Math.max(1, latest - n + 1);
    const draws = await fetchDrawsRange(start, latest);
    const flat = draws.flatMap((d) => d.numbers);
    const result = generateAiRecommend(flat);

    setLoading(false);
    setStatus(
      draws.length === 0
        ? "최근 데이터를 가져오지 못해 균등 무작위로 생성했습니다."
        : `최근 ${draws.length}개 회차 데이터를 참고했습니다.`
    );
    setNumbers(result);
  };

  return (
    <ScreenContainer>
      <ScreenTitle
        title="추천 조합 (재미용)"
        subtitle="최근 데이터 분포를 참고한 무작위 조합을 생성합니다. 당첨을 예측하지 않습니다."
      />

      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        {N_OPTIONS.map((opt) => (
          <SecondaryButton key={opt} title={`${opt}회`} onPress={() => setN(opt)} active={n === opt} />
        ))}
      </View>

      <PrimaryButton title="추천 조합 생성" onPress={generate} disabled={loading} />
      <StatusText text={status} />

      {numbers && (
        <View style={{ marginTop: 16, marginBottom: 20 }}>
          <BallRow numbers={numbers} />
        </View>
      )}

      <Disclaimer text={DISCLAIMER} />
    </ScreenContainer>
  );
}
