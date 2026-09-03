// 등수 판정 공용 로직 (여러 화면에서 재사용)
export const RANK_LABELS: Record<number, string> = {
  1: "1등",
  2: "2등",
  3: "3등",
  4: "4등",
  5: "5등",
};
export const NO_RANK_LABEL = "낙첨";

/**
 * 6개 일치: 1등 / 5개+보너스: 2등 / 5개(보너스 불일치): 3등
 * 4개 일치: 4등 / 3개 일치: 5등 / 그 외: null(낙첨)
 */
export function judgeRank(
  myNumbers: number[],
  winNumbers: number[],
  bonus: number
): number | null {
  const winSet = new Set(winNumbers);
  const match = myNumbers.filter((n) => winSet.has(n)).length;
  const mySet = new Set(myNumbers);

  if (match === 6) return 1;
  if (match === 5 && mySet.has(bonus)) return 2;
  if (match === 5) return 3;
  if (match === 4) return 4;
  if (match === 3) return 5;
  return null;
}

export function rankLabel(rank: number | null): string {
  if (rank === null) return NO_RANK_LABEL;
  return RANK_LABELS[rank] ?? NO_RANK_LABEL;
}
