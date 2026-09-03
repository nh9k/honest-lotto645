"""
동행복권 공식 API를 감싸는 공용 모듈.
- 회차 <-> 날짜 환산
- 회차별 당첨결과 조회 (로컬 JSON 캐시 사용)
- 여러 회차 순회 조회 시 호출 간 딜레이 적용
"""
import json
import os
import time
import datetime as dt
from typing import Optional, Callable

import requests

API_URL = "https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do"
FIRST_DRAW_DATE = dt.date(2002, 12, 7)  # 1회차 추첨일 (매주 토요일)
REQUEST_TIMEOUT = 5
CALL_DELAY_SEC = 0.15  # 회차 순회 호출 간 딜레이 (서버 부하 방지)
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

_CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "cache")
_CACHE_FILE = os.path.join(_CACHE_DIR, "draws.json")

_cache: dict = {}
_cache_loaded = False


def _ensure_cache_loaded() -> None:
    global _cache, _cache_loaded
    if _cache_loaded:
        return
    os.makedirs(_CACHE_DIR, exist_ok=True)
    if os.path.exists(_CACHE_FILE):
        try:
            with open(_CACHE_FILE, "r", encoding="utf-8") as f:
                _cache = json.load(f)
        except (json.JSONDecodeError, OSError):
            _cache = {}
    _cache_loaded = True


def _save_cache() -> None:
    os.makedirs(_CACHE_DIR, exist_ok=True)
    try:
        with open(_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(_cache, f, ensure_ascii=False)
    except OSError:
        pass


def date_to_round(d: dt.date) -> int:
    """주어진 날짜 기준 예상 회차 번호 (1회차=2002-12-07, 매주 토요일)."""
    delta_days = (d - FIRST_DRAW_DATE).days
    if delta_days < 0:
        return 0
    return delta_days // 7 + 1


def round_to_estimated_date(round_no: int) -> dt.date:
    """회차 번호로부터 대략적인 추첨일(토요일)을 역산."""
    return FIRST_DRAW_DATE + dt.timedelta(weeks=round_no - 1)


def estimate_latest_round() -> int:
    """오늘 날짜 기준으로 추정한 최신 회차 번호 (네트워크 없이 계산)."""
    return max(1, date_to_round(dt.date.today()))


def _item_to_result(item: dict) -> dict:
    date_raw = str(item.get("ltRflYmd", ""))  # "YYYYMMDD"
    date_fmt = f"{date_raw[0:4]}-{date_raw[4:6]}-{date_raw[6:8]}" if len(date_raw) == 8 else date_raw
    return {
        "round": item["ltEpsd"],
        "date": date_fmt,
        "numbers": sorted(
            [
                item["tm1WnNo"],
                item["tm2WnNo"],
                item["tm3WnNo"],
                item["tm4WnNo"],
                item["tm5WnNo"],
                item["tm6WnNo"],
            ]
        ),
        "bonus": item.get("bnsWnNo"),
    }


def fetch_draw(round_no: int, use_cache: bool = True) -> Optional[dict]:
    """
    특정 회차의 당첨 결과를 조회.
    동행복권 API가 요청 회차 포함 최근 10개 회차를 함께 내려주므로,
    한 번의 호출로 인접 회차 캐시도 함께 채워진다.
    반환: {"round": int, "date": str, "numbers": [6 int, 오름차순], "bonus": int} 또는 None(미추첨/오류)
    """
    _ensure_cache_loaded()
    key = str(round_no)

    if use_cache and key in _cache:
        return _cache[key]

    try:
        resp = requests.get(
            API_URL,
            params={"srchDir": "center", "srchLtEpsd": round_no},
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, ValueError):
        return None

    items = (data.get("data") or {}).get("list") or []
    result = None
    for item in items:
        parsed = _item_to_result(item)
        _cache[str(parsed["round"])] = parsed
        if parsed["round"] == round_no:
            result = parsed

    if items:
        _save_cache()

    return result


def fetch_draws_range(
    start_round: int,
    end_round: int,
    on_progress: Optional[Callable[[int, int], None]] = None,
) -> list:
    """
    start_round ~ end_round(포함) 구간의 당첨 결과를 순회 조회.
    캐시에 없는 회차만 실제 호출하며, 호출 사이에 딜레이를 둔다.
    on_progress(현재 인덱스, 전체 개수) 콜백으로 진행 상황 전달.
    """
    _ensure_cache_loaded()
    results = []
    rounds = list(range(start_round, end_round + 1))
    total = len(rounds)

    for i, r in enumerate(rounds, start=1):
        was_cached = str(r) in _cache
        draw = fetch_draw(r)
        if draw is not None:
            results.append(draw)
        if on_progress:
            on_progress(i, total)
        if not was_cached:
            time.sleep(CALL_DELAY_SEC)

    return results


def date_range_to_round_range(start_date: dt.date, end_date: dt.date) -> tuple:
    """날짜 범위를 회차 범위로 환산 (최신 회차 추정치로 상한 클램프)."""
    latest = estimate_latest_round()
    start_r = max(1, date_to_round(start_date))
    end_r = min(latest, max(start_r, date_to_round(end_date)))
    return start_r, end_r
