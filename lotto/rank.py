"""등수 판정 공용 로직 (여러 탭에서 재사용)."""
from typing import Optional, Iterable

RANK_LABELS = {
    1: "1등",
    2: "2등",
    3: "3등",
    4: "4등",
    5: "5등",
}
NO_RANK_LABEL = "낙첨"


def judge_rank(my_numbers: Iterable[int], win_numbers: Iterable[int], bonus: int) -> Optional[int]:
    """
    6개 일치: 1등 / 5개+보너스: 2등 / 5개(보너스 불일치): 3등
    4개 일치: 4등 / 3개 일치: 5등 / 그 외: None(낙첨)
    """
    my_set = set(my_numbers)
    win_set = set(win_numbers)
    match = len(my_set & win_set)

    if match == 6:
        return 1
    if match == 5 and bonus in my_set:
        return 2
    if match == 5:
        return 3
    if match == 4:
        return 4
    if match == 3:
        return 5
    return None


def rank_label(rank: Optional[int]) -> str:
    if rank is None:
        return NO_RANK_LABEL
    return RANK_LABELS.get(rank, NO_RANK_LABEL)
