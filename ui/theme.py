"""공 색상, 다크/라이트 테마 공통 상수."""

LIGHT_THEME_NAME = "flatly"
DARK_THEME_NAME = "darkly"

# 구간별 공 색상: 1-10 노랑, 11-20 파랑, 21-30 빨강, 31-40 회색, 41-45 초록
ZONE_COLORS = [
    (1, 10, "#F5C518", "#1a1a1a"),
    (11, 20, "#2E7DE1", "#ffffff"),
    (21, 30, "#E5433D", "#ffffff"),
    (31, 40, "#8A8D91", "#ffffff"),
    (41, 45, "#2FA84F", "#ffffff"),
]

BONUS_RING_COLOR = "#FF9800"
MATCH_RING_COLOR = "#FFD700"
USER_PICK_RING_COLOR = "#2E7DE1"
AUTO_PICK_RING_COLOR = "#2FA84F"

NEUTRAL_UNSELECTED_BG_LIGHT = "#e9ecef"
NEUTRAL_UNSELECTED_FG_LIGHT = "#212529"
NEUTRAL_UNSELECTED_BG_DARK = "#3a3f44"
NEUTRAL_UNSELECTED_FG_DARK = "#e9ecef"


def ball_color(n: int) -> tuple:
    """번호에 해당하는 (배경색, 글자색) 반환."""
    for lo, hi, bg, fg in ZONE_COLORS:
        if lo <= n <= hi:
            return bg, fg
    return "#8A8D91", "#ffffff"
