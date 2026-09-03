import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ScreenContainer from "../components/ScreenContainer";
import { ScreenTitle, PrimaryButton, SecondaryButton, StatusText, Disclaimer } from "../components/Common";
import BarChart from "../components/BarChart";
import { dateRangeToRoundRange, estimateLatestRound, fetchDrawsRange } from "../lotto/api";
import { useAppTheme } from "../theme/ThemeContext";

type Mode = "round" | "date";

export default function Tab4Frequency() {
  const { palette } = useAppTheme();
  const latest = estimateLatestRound();
  const [mode, setMode] = useState<Mode>("round");
  const [startRound, setStartRound] = useState(String(Math.max(1, latest - 51)));
  const [endRound, setEndRound] = useState(String(latest));
  const [startDate, setStartDate] = useState(new Date(Date.now() - 52 * 7 * 24 * 3600 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [counter, setCounter] = useState<Record<number, number> | null>(null);
  const [topList, setTopList] = useState<[number, number][]>([]);
  const [bottomList, setBottomList] = useState<[number, number][]>([]);

  const fetchData = async () => {
    let s: number, e: number;
    if (mode === "round") {
      s = parseInt(startRound, 10);
      e = parseInt(endRound, 10);
    } else {
      [s, e] = dateRangeToRoundRange(startDate, endDate);
    }
    if (!s || !e || s > e || s < 1) {
      setStatus("회차 범위가 올바르지 않습니다.");
      return;
    }

    setLoading(true);
    setCounter(null);
    const total = e - s + 1;
    setStatus(`조회 중... (0/${total})`);

    const draws = await fetchDrawsRange(s, e, (done, tot) => {
      setStatus(`조회 중... (${done}/${tot})`);
    });

    setLoading(false);
    if (draws.length === 0) {
      setStatus("조회된 결과가 없습니다. (인터넷 연결을 확인해주세요)");
      return;
    }

    const c: Record<number, number> = {};
    for (let n = 1; n <= 45; n++) c[n] = 0;
    for (const d of draws) for (const n of d.numbers) c[n] += 1;

    setStatus(`${draws.length}개 회차 조회 완료 (요청 ${total}개 중)`);
    setCounter(c);

    const ranked = Object.entries(c)
      .map(([k, v]) => [Number(k), v] as [number, number])
      .sort((a, b) => b[1] - a[1] || a[0] - b[0]);
    setTopList(ranked.slice(0, 10));
    setBottomList([...ranked].sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 10));
  };

  return (
    <ScreenContainer>
      <ScreenTitle title="실제 결과 빈도 분석" />
      <Disclaimer text="과거 빈도는 통계적으로 다음 회차 예측에 영향을 주지 않습니다." />

      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        <SecondaryButton title="회차 범위" onPress={() => setMode("round")} active={mode === "round"} />
        <SecondaryButton title="날짜 범위" onPress={() => setMode("date")} active={mode === "date"} />
      </View>

      {mode === "round" ? (
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: palette.text, marginRight: 6 }}>시작</Text>
          <TextInput
            value={startRound}
            onChangeText={setStartRound}
            keyboardType="number-pad"
            style={[styles.input, { color: palette.text, borderColor: palette.border }]}
          />
          <Text style={{ color: palette.text, marginHorizontal: 6 }}>~ 종료</Text>
          <TextInput
            value={endRound}
            onChangeText={setEndRound}
            keyboardType="number-pad"
            style={[styles.input, { color: palette.text, borderColor: palette.border }]}
          />
        </View>
      ) : (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: palette.textMuted, marginBottom: 4 }}>시작일</Text>
          <DateTimePicker
            value={startDate}
            mode="date"
            onChange={(_, d) => d && setStartDate(d)}
          />
          <Text style={{ color: palette.textMuted, marginTop: 8, marginBottom: 4 }}>종료일</Text>
          <DateTimePicker value={endDate} mode="date" onChange={(_, d) => d && setEndDate(d)} />
        </View>
      )}

      <PrimaryButton title="조회" onPress={fetchData} disabled={loading} />
      <StatusText text={status} />

      {counter && (
        <>
          <View style={{ marginTop: 12 }}>
            <BarChart data={counter} color={palette.danger} />
          </View>

          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.text, fontWeight: "700", marginBottom: 6 }}>
                빈도 상위 10개
              </Text>
              {topList.map(([n, c]) => (
                <Text key={n} style={{ color: palette.textMuted }}>
                  {n}번 ({c}회)
                </Text>
              ))}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.text, fontWeight: "700", marginBottom: 6 }}>
                빈도 하위 10개
              </Text>
              {bottomList.map(([n, c]) => (
                <Text key={n} style={{ color: palette.textMuted }}>
                  {n}번 ({c}회)
                </Text>
              ))}
            </View>
          </View>
        </>
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
    width: 80,
  },
});
