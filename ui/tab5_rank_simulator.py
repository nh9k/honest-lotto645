import ttkbootstrap as ttk

from lotto import generator, rank
from ui.widgets import make_ball_row, NumberGrid


class Tab5RankSimulator(ttk.Frame):
    def __init__(self, parent):
        super().__init__(parent, padding=16)
        self.win_numbers = None
        self.bonus = None
        self._build()
        self.redraw()

    def _build(self):
        ttk.Label(self, text="등수 시뮬레이터", font=("Segoe UI", 15, "bold")).pack(anchor="w")
        ttk.Label(
            self,
            text="실제 추첨 결과는 예측할 수 없으며, 등수별 당첨 조건을 체험하기 위한 시뮬레이션입니다.",
            foreground="#E5433D",
            font=("Segoe UI", 10, "bold"),
            wraplength=560,
        ).pack(anchor="w", pady=(2, 12))

        ttk.Button(self, text="당첨번호 재추첨", bootstyle="primary", command=self.redraw).pack(anchor="w")

        ttk.Label(self, text="내 번호 6개 선택", padding=(0, 16, 0, 4)).pack(anchor="w")
        self.grid = NumberGrid(self, max_select=6, on_change=self._on_grid_change)
        self.grid.pack(anchor="w")

        self.check_btn = ttk.Button(
            self, text="결과 확인", bootstyle="primary", command=self.check, state="disabled"
        )
        self.check_btn.pack(anchor="w", pady=(12, 4))

        self.result_holder = ttk.Frame(self, padding=(0, 12))
        self.result_holder.pack(anchor="w", fill="x")

    def redraw(self):
        self.win_numbers, self.bonus = generator.generate_draw()
        self.grid.clear()
        for w in self.result_holder.winfo_children():
            w.destroy()

    def _on_grid_change(self, selected: set):
        self.check_btn.configure(state="normal" if len(selected) == 6 else "disabled")

    def check(self):
        my_numbers = self.grid.get_selected()
        if len(my_numbers) != 6 or self.win_numbers is None:
            return

        for w in self.result_holder.winfo_children():
            w.destroy()

        match_set = set(self.win_numbers) & set(my_numbers)

        ttk.Label(self.result_holder, text="당첨번호", foreground="#888888").pack(anchor="w")
        win_row = make_ball_row(
            self.result_holder, self.win_numbers, bonus=self.bonus, match_set=match_set
        )
        win_row.pack(anchor="w", pady=(2, 12))

        ttk.Label(self.result_holder, text="내 번호", foreground="#888888").pack(anchor="w")
        my_row = make_ball_row(self.result_holder, my_numbers, match_set=match_set)
        my_row.pack(anchor="w", pady=(2, 12))

        result_rank = rank.judge_rank(my_numbers, self.win_numbers, self.bonus)
        ttk.Label(
            self.result_holder, text=f"{rank.rank_label(result_rank)}입니다",
            font=("Segoe UI", 14, "bold"), foreground="#2FA84F",
        ).pack(anchor="w")
