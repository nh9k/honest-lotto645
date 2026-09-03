import tkinter as tk
import ttkbootstrap as ttk

from lotto import generator
from ui.widgets import make_ball_row


class Tab1Generate(ttk.Frame):
    def __init__(self, parent):
        super().__init__(parent, padding=16)
        self.avoid_var = tk.BooleanVar(value=False)
        self._build()

    def _build(self):
        ttk.Label(self, text="번호 생성", font=("Segoe UI", 15, "bold")).pack(anchor="w")
        ttk.Label(
            self,
            text="1~45 중 중복 없이 6개를 무작위로 뽑습니다.",
            foreground="#888888",
        ).pack(anchor="w", pady=(0, 12))

        ttk.Checkbutton(
            self,
            text="많이 겹치는 조합 피하기 (31 이하 숫자 5개 이상 시 재추첨)",
            variable=self.avoid_var,
            bootstyle="round-toggle",
        ).pack(anchor="w", pady=(0, 12))

        ttk.Button(self, text="번호 뽑기", bootstyle="primary", command=self.draw).pack(anchor="w")

        self.result_holder = ttk.Frame(self, padding=(0, 20))
        self.result_holder.pack(anchor="w", fill="x")

    def draw(self):
        for w in self.result_holder.winfo_children():
            w.destroy()
        numbers = generator.generate_basic(avoid_low_heavy=self.avoid_var.get())
        row = make_ball_row(self.result_holder, numbers)
        row.pack(anchor="w")
