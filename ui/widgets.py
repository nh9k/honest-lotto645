"""로또 공 배지, 번호 선택 그리드 등 공용 위젯."""
import tkinter as tk
import ttkbootstrap as ttk
from typing import Callable, Optional, Iterable

from ui.theme import (
    ball_color,
    BONUS_RING_COLOR,
    MATCH_RING_COLOR,
    USER_PICK_RING_COLOR,
    AUTO_PICK_RING_COLOR,
    NEUTRAL_UNSELECTED_BG_LIGHT,
    NEUTRAL_UNSELECTED_FG_LIGHT,
)


def make_ball(parent, number: int, size: int = 44, ring_color: Optional[str] = None, bg="#f4f4f4") -> tk.Canvas:
    """번호 1개를 원형 배지로 그린 Canvas 위젯을 반환."""
    pad = 4
    canvas = tk.Canvas(parent, width=size + pad, height=size + pad, highlightthickness=0, bg=bg)
    fill, fg = ball_color(number)
    x0, y0 = pad // 2, pad // 2
    x1, y1 = x0 + size, y0 + size

    if ring_color:
        canvas.create_oval(x0 - 3, y0 - 3, x1 + 3, y1 + 3, outline=ring_color, width=3)

    canvas.create_oval(x0, y0, x1, y1, fill=fill, outline=fill)
    canvas.create_text((x0 + x1) // 2, (y0 + y1) // 2, text=str(number), fill=fg,
                        font=("Segoe UI", 12, "bold"))
    return canvas


def make_ball_row(
    parent,
    numbers: Iterable[int],
    bonus: Optional[int] = None,
    match_set: Optional[set] = None,
    user_picked: Optional[set] = None,
    auto_picked: Optional[set] = None,
    bg="#f4f4f4",
) -> ttk.Frame:
    """번호 목록을 가로로 나열한 Frame. match/사용자선택/자동선택 강조 옵션 지원."""
    frame = ttk.Frame(parent)
    match_set = match_set or set()
    user_picked = user_picked or set()
    auto_picked = auto_picked or set()

    for n in numbers:
        ring = None
        if n in match_set:
            ring = MATCH_RING_COLOR
        elif n in user_picked:
            ring = USER_PICK_RING_COLOR
        elif n in auto_picked:
            ring = AUTO_PICK_RING_COLOR
        ball = make_ball(frame, n, ring_color=ring, bg=bg)
        ball.pack(side="left", padx=3)

    if bonus is not None:
        sep = ttk.Label(frame, text="+", font=("Segoe UI", 14, "bold"))
        sep.pack(side="left", padx=(8, 8))
        ring = MATCH_RING_COLOR if bonus in match_set else BONUS_RING_COLOR
        ball = make_ball(frame, bonus, ring_color=ring, bg=bg)
        ball.pack(side="left", padx=3)

    return frame


class NumberGrid(ttk.Frame):
    """1~45 번호를 클릭해서 선택하는 그리드. max_select개까지 선택 가능."""

    def __init__(self, parent, max_select: int = 6, columns: int = 9,
                 on_change: Optional[Callable[[set], None]] = None):
        super().__init__(parent)
        self.max_select = max_select
        self.on_change = on_change
        self.selected: set = set()
        self.buttons: dict = {}

        for n in range(1, 46):
            btn = tk.Button(
                self, text=str(n), width=3, height=1, relief="flat", bd=1,
                bg=NEUTRAL_UNSELECTED_BG_LIGHT, fg=NEUTRAL_UNSELECTED_FG_LIGHT,
                activebackground=NEUTRAL_UNSELECTED_BG_LIGHT,
                font=("Segoe UI", 10), cursor="hand2",
                command=lambda n=n: self.toggle(n),
            )
            row, col = divmod(n - 1, columns)
            btn.grid(row=row, column=col, padx=2, pady=2)
            self.buttons[n] = btn

    def toggle(self, n: int):
        if n in self.selected:
            self.selected.remove(n)
            self._paint(n, False)
        else:
            if len(self.selected) >= self.max_select:
                return
            self.selected.add(n)
            self._paint(n, True)
        if self.on_change:
            self.on_change(set(self.selected))

    def _paint(self, n: int, selected: bool):
        btn = self.buttons[n]
        if selected:
            bg, fg = ball_color(n)
            btn.configure(bg=bg, fg=fg, activebackground=bg, relief="solid", bd=2)
        else:
            btn.configure(bg=NEUTRAL_UNSELECTED_BG_LIGHT, fg=NEUTRAL_UNSELECTED_FG_LIGHT,
                           activebackground=NEUTRAL_UNSELECTED_BG_LIGHT, relief="flat", bd=1)

    def clear(self):
        for n in list(self.selected):
            self.selected.remove(n)
            self._paint(n, False)
        if self.on_change:
            self.on_change(set(self.selected))

    def get_selected(self) -> list:
        return sorted(self.selected)
