// 번호 생성/시뮬레이션 로직. 실제 당첨을 예측하지 않는 순수 무작위/통계 유틸리티.
export const ALL_NUMBERS: number[] = Array.from({ length: 45 }, (_, i) => i + 1);
export const ZONES: [number, number][] = [
  [1, 10],
  [11, 20],
  [21, 30],
  [31, 40],
  [41, 45],
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sampleN<T>(pool: T[], n: number): T[] {
  return shuffle(pool).slice(0, n);
}

export function isLowHeavy(numbers: number[], threshold = 31, minCount = 5): boolean {
  return numbers.filter((n) => n <= threshold).length >= minCount;
}

export function maxConsecutiveRun(numbers: number[]): number {
  const nums = [...numbers].sort((a, b) => a - b);
  if (nums.length === 0) return 0;
  let best = 1;
  let cur = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1] + 1) {
      cur += 1;
    } else {
      cur = 1;
    }
    best = Math.max(best, cur);
  }
  return best;
}

// ---------- 탭1. 번호 생성 ----------
export function generateBasic(avoidLowHeavy = false, maxAttempts = 1000): number[] {
  for (let i = 0; i < maxAttempts; i++) {
    const nums = sampleN(ALL_NUMBERS, 6).sort((a, b) => a - b);
    if (avoidLowHeavy && isLowHeavy(nums)) continue;
    return nums;
  }
  return sampleN(ALL_NUMBERS, 6).sort((a, b) => a - b);
}

// ---------- 탭2. 번호 자동완성 ----------
export function autocomplete(selected: number[]): number[] {
  const selectedSet = new Set(selected);
  const remainNeeded = 6 - selectedSet.size;
  const pool = ALL_NUMBERS.filter((n) => !selectedSet.has(n));
  const picked = sampleN(pool, remainNeeded);
  return [...selectedSet, ...picked].sort((a, b) => a - b);
}

// ---------- 탭3. 무작위성 실험 ----------
export function simulateFrequency(
  nDraws: number,
  onProgress?: (done: number, total: number) => void,
  progressStep = 1000
): Record<number, number> {
  const counter: Record<number, number> = {};
  for (const n of ALL_NUMBERS) counter[n] = 0;

  for (let i = 1; i <= nDraws; i++) {
    for (const n of sampleN(ALL_NUMBERS, 6)) counter[n] += 1;
    if (onProgress && (i % progressStep === 0 || i === nDraws)) {
      onProgress(i, nDraws);
    }
  }
  return counter;
}

// ---------- 탭5. 등수 시뮬레이터 ----------
export interface DrawResult {
  winNumbers: number[];
  bonus: number;
}

export function generateDraw(): DrawResult {
  const winNumbers = sampleN(ALL_NUMBERS, 6);
  const bonus = sampleN(
    ALL_NUMBERS.filter((n) => !winNumbers.includes(n)),
    1
  )[0];
  return { winNumbers: [...winNumbers].sort((a, b) => a - b), bonus };
}

// ---------- 탭7. 추천 조합 (재미용) ----------
function zoneNumbers(lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let n = lo; n <= hi; n++) out.push(n);
  return out;
}

function weightedPick(candidates: number[], weightOf: (n: number) => number): number {
  const weights = candidates.map(weightOf);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

/**
 * recentNumbersFlat: 최근 N회차 당첨번호를 모두 펼친 배열 (없으면 빈 배열 -> 균등 취급)
 * 규칙: 최근 적게 나온 번호 우선 가중치, 5개 구간 각 최소1개, 연속 최대2개, 31이하 5개 이상 금지
 */
export function generateAiRecommend(recentNumbersFlat: number[], maxAttempts = 500): number[] {
  const freq: Record<number, number> = {};
  for (const n of ALL_NUMBERS) freq[n] = 0;
  for (const n of recentNumbersFlat) freq[n] = (freq[n] ?? 0) + 1;
  const maxFreq = Math.max(...ALL_NUMBERS.map((n) => freq[n]));

  const weight = (n: number) => maxFreq - freq[n] + 1;

  let best: number[] = [];
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const chosen: number[] = [];
    for (const [lo, hi] of ZONES) {
      const zoneNums = zoneNumbers(lo, hi).filter((n) => !chosen.includes(n));
      chosen.push(weightedPick(zoneNums, weight));
    }
    const remainingPool = ALL_NUMBERS.filter((n) => !chosen.includes(n));
    chosen.push(weightedPick(remainingPool, weight));

    const sorted = [...chosen].sort((a, b) => a - b);
    best = sorted;
    if (maxConsecutiveRun(sorted) <= 2 && !isLowHeavy(sorted)) {
      return sorted;
    }
  }
  return best;
}
