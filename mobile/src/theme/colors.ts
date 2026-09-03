// 공 색상, 다크/라이트 테마 공통 상수
export interface ZoneColor {
  lo: number;
  hi: number;
  bg: string;
  fg: string;
}

// 구간별 공 색상: 1-10 노랑, 11-20 파랑, 21-30 빨강, 31-40 회색, 41-45 초록
export const ZONE_COLORS: ZoneColor[] = [
  { lo: 1, hi: 10, bg: "#F5C518", fg: "#1a1a1a" },
  { lo: 11, hi: 20, bg: "#2E7DE1", fg: "#ffffff" },
  { lo: 21, hi: 30, bg: "#E5433D", fg: "#ffffff" },
  { lo: 31, hi: 40, bg: "#8A8D91", fg: "#ffffff" },
  { lo: 41, hi: 45, bg: "#2FA84F", fg: "#ffffff" },
];

export function ballColor(n: number): { bg: string; fg: string } {
  const zone = ZONE_COLORS.find((z) => n >= z.lo && n <= z.hi);
  return zone ? { bg: zone.bg, fg: zone.fg } : { bg: "#8A8D91", fg: "#ffffff" };
}

export const BONUS_RING_COLOR = "#FF9800";
export const MATCH_RING_COLOR = "#FFD700";
export const USER_PICK_RING_COLOR = "#2E7DE1";
export const AUTO_PICK_RING_COLOR = "#2FA84F";

export interface Palette {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  danger: string;
  neutralUnselectedBg: string;
  neutralUnselectedFg: string;
}

export const LIGHT_PALETTE: Palette = {
  background: "#f5f6f8",
  surface: "#ffffff",
  text: "#1a1a1a",
  textMuted: "#888888",
  border: "#e0e0e0",
  primary: "#2E7DE1",
  danger: "#E5433D",
  neutralUnselectedBg: "#e9ecef",
  neutralUnselectedFg: "#212529",
};

export const DARK_PALETTE: Palette = {
  background: "#121212",
  surface: "#1e1e1e",
  text: "#f0f0f0",
  textMuted: "#a0a0a0",
  border: "#333333",
  primary: "#4d94ff",
  danger: "#ff6b63",
  neutralUnselectedBg: "#2c2f33",
  neutralUnselectedFg: "#e9ecef",
};
