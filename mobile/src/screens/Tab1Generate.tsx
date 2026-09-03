import React, { useState } from "react";
import { Switch, Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import { ScreenTitle, PrimaryButton } from "../components/Common";
import BallRow from "../components/BallRow";
import { generateBasic } from "../lotto/generator";
import { useAppTheme } from "../theme/ThemeContext";

export default function Tab1Generate() {
  const { palette } = useAppTheme();
  const [avoidLowHeavy, setAvoidLowHeavy] = useState(false);
  const [numbers, setNumbers] = useState<number[] | null>(null);

  const draw = () => setNumbers(generateBasic(avoidLowHeavy));

  return (
    <ScreenContainer>
      <ScreenTitle
        title="번호 생성"
        subtitle="1~45 중 중복 없이 6개를 무작위로 뽑습니다."
      />

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <Switch value={avoidLowHeavy} onValueChange={setAvoidLowHeavy} />
        <Text style={{ color: palette.text, marginLeft: 8, flex: 1 }}>
          많이 겹치는 조합 피하기 (31 이하 숫자 5개 이상 시 재추첨)
        </Text>
      </View>

      <PrimaryButton title="번호 뽑기" onPress={draw} />

      {numbers && (
        <View style={{ marginTop: 24 }}>
          <BallRow numbers={numbers} />
        </View>
      )}
    </ScreenContainer>
  );
}
