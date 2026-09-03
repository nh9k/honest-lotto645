"""번호 생성/시뮬레이션 로직. 모든 함수는 실제 당첨을 예측하지 않는 순수 무작위/통계 유틸리티."""
import random
from collections import Counter
from typing import Iterable, Optional, Callable

ALL_NUMBERS = list(range(1, 46))
ZONES = [(1, 10), (11, 20), (21, 30), (31, 40), (41, 45)]  # 공 색상 구간과 동일


def is_low_heavy(numbers: Iterable[int], threshold: int = 31, min_count: int = 5) -> bool:
    """31 이하 숫자가 min_count개 이상인지 여부 (여러 탭에서 재사용)."""
    return sum(1 for n in numbers if n <= threshold) >= min_count


def max_consecutive_run(numbers: Iterable[int]) -> int:
    nums = sorted(numbers)
    if not nums:
        return 0
    best = cur = 1
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1] + 1:
            cur += 1
        else:
            cur = 1
        best = max(best, cur)
    return best


# ---------- 탭1. 번호 생성 ----------
def generate_basic(avoid_low_heavy: bool = False, max_attempts: int = 1000) -> list:
    for _ in range(max_attempts):
        nums = sorted(random.sample(ALL_NUMBERS, 6))
        if avoid_low_heavy and is_low_heavy(nums):
            continue
        return nums
    return sorted(random.sample(ALL_NUMBERS, 6))


# ---------- 탭2. 번호 자동완성 ----------
def autocomplete(selected: Iterable[int]) -> list:
    """선택된 번호(1~5개)는 유지하고, 나머지를 무작위로 채워 6개 반환."""
    selected = set(selected)
    remain_needed = 6 - len(selected)
    pool = [n for n in ALL_NUMBERS if n not in selected]
    picked = random.sample(pool, remain_needed)
    return sorted(selected | set(picked))


# ---------- 탭3. 무작위성 실험 ----------
def simulate_frequency(
    n_draws: int,
    on_progress: Optional[Callable[[int, int], None]] = None,
    progress_step: int = 1000,
) -> Counter:
    counter = Counter({n: 0 for n in ALL_NUMBERS})
    for i in range(1, n_draws + 1):
        for n in random.sample(ALL_NUMBERS, 6):
            counter[n] += 1
        if on_progress and (i % progress_step == 0 or i == n_draws):
            on_progress(i, n_draws)
    return counter


# ---------- 탭5. 등수 시뮬레이터 ----------
def generate_draw():
    """가상 당첨번호 6개 + 보너스번호 생성. 반환: (win_numbers, bonus)"""
    win_numbers = random.sample(ALL_NUMBERS, 6)
    bonus = random.choice([n for n in ALL_NUMBERS if n not in win_numbers])
    return sorted(win_numbers), bonus


# ---------- 탭7. 추천 조합 (재미용) ----------
def _zone_of(n: int) -> int:
    for idx, (lo, hi) in enumerate(ZONES):
        if lo <= n <= hi:
            return idx
    return len(ZONES) - 1


def generate_ai_recommend(recent_numbers_flat: Iterable[int], max_attempts: int = 500) -> list:
    """
    recent_numbers_flat: 최근 N회차 당첨번호를 모두 펼친 리스트 (없으면 빈 리스트 -> 균등 취급)
    규칙: 최근 적게 나온 번호 우선 가중치, 5개 구간 각 최소1개, 연속 최대2개, 31이하 5개 이상 금지
    """
    freq = Counter({n: 0 for n in ALL_NUMBERS})
    freq.update(recent_numbers_flat)
    max_freq = max(freq.values()) if freq else 0

    def weight(n: int) -> float:
        return (max_freq - freq[n]) + 1  # 적게 나올수록 가중치 큼

    def weighted_sample_one(candidates: list) -> int:
        weights = [weight(n) for n in candidates]
        return random.choices(candidates, weights=weights, k=1)[0]

    best_candidate = None
    for _ in range(max_attempts):
        chosen = []
        for lo, hi in ZONES:
            zone_nums = [n for n in range(lo, hi + 1) if n not in chosen]
            chosen.append(weighted_sample_one(zone_nums))

        remaining_pool = [n for n in ALL_NUMBERS if n not in chosen]
        chosen.append(weighted_sample_one(remaining_pool))

        chosen_sorted = sorted(chosen)
        best_candidate = chosen_sorted
        if max_consecutive_run(chosen_sorted) <= 2 and not is_low_heavy(chosen_sorted):
            return chosen_sorted

    return best_candidate
