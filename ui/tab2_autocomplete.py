import ttkbootstrap as ttk

from lotto import generator
from ui.widgets import NumberGrid, make_ball_row


class Tab2Autocomplete(ttk.Frame):
    def __init__(self, parent):
        super().__init__(parent, padding=16)
        self._build()

    def _build(self):
        ttk.Label(self, text="번호 자동완성", font=("Segoe UI", 15, "bold")).pack(anchor="w")
        ttk.Label(
            self,
            text="원하는 번호를 1~5개 직접 선택하면, 나머지를 무작위로 채워 6개를 완성합니다.",
            foreground="#888888",
        ).pack(anchor="w", pady=(0, 12))

        self.grid = NumberGrid(self, max_select=6, on_change=self._on_change)
        self.grid.pack(anchor="w")

        btn_row = ttk.Frame(self, padding=(0, 12))
        btn_row.pack(anchor="w")
        self.recommend_btn = ttk.Button(
            btn_row, text="나머지 추천받기", bootstyle="primary", command=self.recommend
        )
        self.recommend_btn.pack(side="left")
        ttk.Button(btn_row, text="초기화", bootstyle="secondary-outline", command=self.reset).pack(
            side="left", padx=(8, 0)
        )

        self.status_label = ttk.Label(self, text="", foreground="#888888")
        self.status_label.pack(anchor="w", pady=(4, 12))

        self.legend = ttk.Label(
            self, text="파란 테두리 = 직접 선택   |   초록 테두리 = 자동완성", foreground="#888888"
        )
        self.legend.pack(anchor="w")

        self.result_holder = ttk.Frame(self, padding=(0, 16))
        self.result_holder.pack(anchor="w", fill="x")

    def _on_change(self, selected: set):
        for w in self.result_holder.winfo_children():
            w.destroy()
        if len(selected) >= 6:
            self.status_label.configure(text="이미 6개를 모두 선택하셨어요.")
            self.recommend_btn.configure(state="disabled")
        elif len(selected) == 0:
            self.status_label.configure(text="1~5개의 번호를 선택해주세요.")
            self.recommend_btn.configure(state="disabled")
        else:
            self.status_label.configure(text=f"{len(selected)}개 선택됨")
            self.recommend_btn.configure(state="normal")

    def recommend(self):
        for w in self.result_holder.winfo_children():
            w.destroy()
        user_picked = set(self.grid.get_selected())
        if not user_picked or len(user_picked) >= 6:
            return
        full = generator.autocomplete(user_picked)
        auto_picked = set(full) - user_picked
        row = make_ball_row(self.result_holder, full, user_picked=user_picked, auto_picked=auto_picked)
        row.pack(anchor="w")

    def reset(self):
        self.grid.clear()
        for w in self.result_holder.winfo_children():
            w.destroy()
