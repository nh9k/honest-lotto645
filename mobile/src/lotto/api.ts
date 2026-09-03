// 동행복권 공식 API를 감싸는 공용 모듈.
// - 회차 <-> 날짜 환산
// - 회차별 당첨결과 조회 (AsyncStorage 로컬 캐시 사용)
// - 여러 회차 순회 조회 시 호출 간 딜레이 적용
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL = "https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do";
export const FIRST_DRAW_DATE = new Date(Date.UTC(2002, 11, 7)); // 1회차 추첨일 (매주 토요일)
const REQUEST_TIMEOUT_MS = 6000;
const CALL_DELAY_MS = 150; // 회차 순회 호출 간 딜레이 (서버 부하 방지)
const CACHE_KEY = "lotto_draws_cache_v1";

export interface DrawResult {
  round: number;
  date: string;
  numbers: number[]; // 오름차순 6개
  bonus: number;
}

let cache: Record<string, DrawResult> | null = null;

async function ensureCacheLoaded(): Promise<Record<string, DrawResult>> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
  return cache!;
}

async function saveCache(): Promise<void> {
  if (!cache) return;
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // 캐시 저장 실패는 무시 (다음 호출에서 재시도)
  }
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function dateToRound(d: Date): number {
  const delta = daysBetween(FIRST_DRAW_DATE, d);
  if (delta < 0) return 0;
  return Math.floor(delta / 7) + 1;
}

export function estimateLatestRound(): number {
  return Math.max(1, dateToRound(new Date()));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function itemToResult(item: any): DrawResult {
  const dateRaw = String(item.ltRflYmd ?? ""); // "YYYYMMDD"
  const date =
    dateRaw.length === 8
      ? `${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}`
      : dateRaw;
  return {
    round: item.ltEpsd,
    date,
    numbers: [
      item.tm1WnNo,
      item.tm2WnNo,
      item.tm3WnNo,
      item.tm4WnNo,
      item.tm5WnNo,
      item.tm6WnNo,
    ].sort((a: number, b: number) => a - b),
    bonus: item.bnsWnNo,
  };
}

/**
 * 특정 회차의 당첨 결과를 조회.
 * 동행복권 API가 요청 회차 포함 최근 10개 회차를 함께 내려주므로,
 * 한 번의 호출로 인접 회차 캐시도 함께 채워진다.
 * 반환: DrawResult 또는 null(미추첨/오류)
 */
export async function fetchDraw(roundNo: number, useCache = true): Promise<DrawResult | null> {
  const c = await ensureCacheLoaded();
  const key = String(roundNo);

  if (useCache && c[key]) return c[key];

  try {
    const res = await fetchWithTimeout(
      `${API_URL}?srchDir=center&srchLtEpsd=${roundNo}`,
      REQUEST_TIMEOUT_MS
    );
    const data = await res.json();
    const items: any[] = data?.data?.list ?? [];

    let result: DrawResult | null = null;
    for (const item of items) {
      const parsed = itemToResult(item);
      c[String(parsed.round)] = parsed;
      if (parsed.round === roundNo) result = parsed;
    }

    if (items.length > 0) await saveCache();
    return result;
  } catch {
    return null;
  }
}

/**
 * startRound ~ endRound(포함) 구간의 당첨 결과를 순회 조회.
 * 캐시에 없는 회차만 실제 호출하며, 호출 사이에 딜레이를 둔다.
 */
export async function fetchDrawsRange(
  startRound: number,
  endRound: number,
  onProgress?: (done: number, total: number) => void
): Promise<DrawResult[]> {
  const c = await ensureCacheLoaded();
  const rounds: number[] = [];
  for (let r = startRound; r <= endRound; r++) rounds.push(r);

  const results: DrawResult[] = [];
  for (let i = 0; i < rounds.length; i++) {
    const r = rounds[i];
    const wasCached = !!c[String(r)];
    const draw = await fetchDraw(r);
    if (draw) results.push(draw);
    onProgress?.(i + 1, rounds.length);
    if (!wasCached) await sleep(CALL_DELAY_MS);
  }
  return results;
}

export function dateRangeToRoundRange(startDate: Date, endDate: Date): [number, number] {
  const latest = estimateLatestRound();
  const startR = Math.max(1, dateToRound(startDate));
  const endR = Math.min(latest, Math.max(startR, dateToRound(endDate)));
  return [startR, endR];
}
