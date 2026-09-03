import threading
import tkinter as tk
import ttkbootstrap as ttk

from lotto import api, generator
from ui.widgets import make_ball_row

N_OPTIONS = [20, 50, 100]

DISCLAIMER = (
    "이 조합은 무작위 생성 규칙에 따른 것으로, 실제 당첨 확률을 높이지 않습니다.\n"
    "로또는 매회 독립적인 무작위 추첨이며, 어떤 방법으로도 다음 회차를 예측할 수 없습니다."
)


class Tab7AiRecommend(ttk.Frame):
    def __init__(self, parent):
        super().__init__(parent, padding=16)
        self.n_var = tk.IntVar(value=N_OPTIONS[0])
        self._build()

    def _build(self):
        ttk.Label(self, text="추천 조합 (재미용)", font=("Segoe UI", 15, "bold")).pack(anchor="w")
        ttk.Label(
            self,
            text="최근 데이터 분포를 참고한 무작위 조합을 생성합니다. 당첨을 예측하지 않습니다.",
            foreground="#888888",
            wraplength=560,
        ).pack(anchor="w", pady=(0, 12))

        n_row = ttk.Frame(self)
        n_row.pack(anchor="w")
        ttk.Label(n_row, text="참고할 최근 회차 수").pack(side="left")
        for n in N_OPTIONS:
            ttk.Radiobutton(n_row, text=f"{n}회", variable=self.n_var, value=n, bootstyle="toolbutton").pack(
                side="left", padx=(6, 0)
            )

        self.gen_btn = ttk.Button(self, text="추천 조합 생성", bootstyle="primary", command=self.generate)
        self.gen_btn.pack(anchor="w", pady=(12, 4))

        self.status_label = ttk.Label(self, text="", foreground="#888888")
        self.status_label.pack(anchor="w", pady=(0, 8))

        self.result_holder = ttk.Frame(self, padding=(0, 12))
        self.result_holder.pack(anchor="w", fill="x")

        ttk.Label(
            self, text=DISCLAIMER, foreground="#E5433D", font=("Segoe UI", 10, "bold"),
            justify="left", wraplength=560,
        ).pack(anchor="w", pady=(16, 0))

    def generate(self):
        n = self.n_var.get()
        self.gen_btn.configure(state="disabled")
        self.status_label.configure(text="최근 데이터 조회 중...")
        for w in self.result_holder.winfo_children():
            w.destroy()

        def worker():
            latest = api.estimate_latest_round()
            start = max(1, latest - n + 1)
            draws = api.fetch_draws_range(start, latest)
            flat = [num for d in draws for num in d["numbers"]]
            numbers = generator.generate_ai_recommend(flat)
            self.after(0, lambda: self._finish(numbers, len(draws)))

        threading.Thread(target=worker, daemon=True).start()

    def _finish(self, numbers, used_draws):
        self.gen_btn.configure(state="normal")
        if used_draws == 0:
            self.status_label.configure(text="최근 데이터를 가져오지 못해 균등 무작위로 생성했습니다.")
        else:
            self.status_label.configure(text=f"최근 {used_draws}개 회차 데이터를 참고했습니다.")

        row = make_ball_row(self.result_holder, numbers)
        row.pack(anchor="w")
