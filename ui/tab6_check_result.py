import threading
import tkinter as tk
import ttkbootstrap as ttk

from lotto import api, rank
from ui.widgets import NumberGrid, make_ball_row


class Tab6CheckResult(ttk.Frame):
    def __init__(self, parent):
        super().__init__(parent, padding=16)
        self._build()

    def _build(self):
        ttk.Label(self, text="회차 선택 결과 확인", font=("Segoe UI", 15, "bold")).pack(anchor="w")
        ttk.Label(
            self,
            text="원하는 회차의 실제 당첨번호와 내가 고른 번호를 비교합니다.",
            foreground="#888888",
        ).pack(anchor="w", pady=(0, 12))

        latest = api.estimate_latest_round()
        round_row = ttk.Frame(self)
        round_row.pack(anchor="w")
        ttk.Label(round_row, text="회차 선택").pack(side="left")
        self.round_var = tk.IntVar(value=latest)
        ttk.Spinbox(round_row, from_=1, to=latest, width=8, textvariable=self.round_var).pack(
            side="left", padx=(6, 0)
        )

        ttk.Label(self, text="내 번호 6개 선택", padding=(0, 12, 0, 4)).pack(anchor="w")
        self.grid = NumberGrid(self, max_select=6, on_change=self._on_grid_change)
        self.grid.pack(anchor="w")

        self.check_btn = ttk.Button(
            self, text="결과 확인", bootstyle="primary", command=self.check, state="disabled"
        )
        self.check_btn.pack(anchor="w", pady=(12, 4))

        self.status_label = ttk.Label(self, text="", foreground="#888888")
        self.status_label.pack(anchor="w", pady=(0, 8))

        self.result_holder = ttk.Frame(self, padding=(0, 8))
        self.result_holder.pack(anchor="w", fill="x")

    def _on_grid_change(self, selected: set):
        self.check_btn.configure(state="normal" if len(selected) == 6 else "disabled")

    def check(self):
        my_numbers = self.grid.get_selected()
        if len(my_numbers) != 6:
            return
        round_no = self.round_var.get()
        self.check_btn.configure(state="disabled")
        self.status_label.configure(text="조회 중...")
        for w in self.result_holder.winfo_children():
            w.destroy()

        def worker():
            draw = api.fetch_draw(round_no)
            self.after(0, lambda: self._finish(draw, my_numbers, round_no))

        threading.Thread(target=worker, daemon=True).start()

    def _finish(self, draw, my_numbers, round_no):
        self.check_btn.configure(state="normal")

        if draw is None:
            self.status_label.configure(text="아직 추첨되지 않은 회차이거나 조회에 실패했습니다.")
            return

        self.status_label.configure(text=f"{round_no}회 ({draw['date']}) 결과")

        win_numbers = draw["numbers"]
        bonus = draw["bonus"]
        match_set = set(win_numbers) & set(my_numbers)

        ttk.Label(self.result_holder, text="당첨번호", foreground="#888888").pack(anchor="w")
        win_row = make_ball_row(self.result_holder, win_numbers, bonus=bonus, match_set=match_set)
        win_row.pack(anchor="w", pady=(2, 12))

        ttk.Label(self.result_holder, text="내 번호", foreground="#888888").pack(anchor="w")
        my_row = make_ball_row(self.result_holder, my_numbers, match_set=match_set)
        my_row.pack(anchor="w", pady=(2, 12))

        result_rank = rank.judge_rank(my_numbers, win_numbers, bonus)
        ttk.Label(
            self.result_holder, text=f"{rank.rank_label(result_rank)}입니다",
            font=("Segoe UI", 14, "bold"), foreground="#2FA84F",
        ).pack(anchor="w")
