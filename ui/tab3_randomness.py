import threading
import queue
import tkinter as tk
import ttkbootstrap as ttk

from ui import mpl_setup  # noqa: F401  (한글 폰트 설정 적용)
from matplotlib.figure import Figure
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

from lotto import generator
from ui.widgets import ScrollableFrame

DRAW_OPTIONS = [100, 1_000, 10_000, 100_000]


class Tab3Randomness(ttk.Frame):
    def __init__(self, parent):
        super().__init__(parent)
        self._progress_queue = queue.Queue()
        scroll = ScrollableFrame(self)
        scroll.pack(fill="both", expand=True)
        self.body = scroll.body
        self.body.configure(padding=16)
        self._build()

    def _build(self):
        body = self.body
        ttk.Label(body, text="무작위성 실험", font=("Segoe UI", 15, "bold")).pack(anchor="w")
        ttk.Label(
            body,
            text="가상 추첨을 여러 번 반복해 번호별 등장 빈도를 확인합니다.",
            foreground="#888888",
        ).pack(anchor="w", pady=(0, 12))

        control_row = ttk.Frame(body)
        control_row.pack(anchor="w", fill="x")

        self.count_label = ttk.Label(control_row, text=f"추첨 횟수: {DRAW_OPTIONS[0]:,}회", width=22)
        self.count_label.pack(side="left")

        self.scale_idx = tk.IntVar(value=0)
        scale = ttk.Scale(
            control_row, from_=0, to=len(DRAW_OPTIONS) - 1, orient="horizontal",
            variable=self.scale_idx, length=260, command=self._on_scale_move,
        )
        scale.pack(side="left", padx=(8, 0))

        self.run_btn = ttk.Button(body, text="시뮬레이션 실행", bootstyle="primary", command=self.run)
        self.run_btn.pack(anchor="w", pady=(12, 4))

        self.progress = ttk.Progressbar(body, mode="determinate", length=300)
        self.progress.pack(anchor="w", pady=(0, 12))

        self.fig = Figure(figsize=(9.0, 3.6), dpi=100)
        self.ax = self.fig.add_subplot(111)
        self._draw_empty_chart()
        self.canvas = FigureCanvasTkAgg(self.fig, master=body)
        self.canvas.get_tk_widget().pack(fill="both", expand=True)

        ttk.Label(
            body,
            text="추첨 횟수를 늘려도 특정 번호가 계속 우세해지지 않는다 = 매회 독립적인 무작위 추첨",
            foreground="#888888",
            wraplength=560,
        ).pack(anchor="w", pady=(8, 0))

    def _on_scale_move(self, _val):
        idx = round(self.scale_idx.get())
        self.scale_idx.set(idx)
        self.count_label.configure(text=f"추첨 횟수: {DRAW_OPTIONS[idx]:,}회")

    def _draw_empty_chart(self):
        self.ax.clear()
        self.ax.set_xlabel("번호")
        self.ax.set_ylabel("등장 횟수")
        self.ax.set_xlim(0.5, 45.5)
        self.ax.set_xticks(range(1, 46))
        self.ax.tick_params(axis="x", labelsize=6)

    def run(self):
        n_draws = DRAW_OPTIONS[round(self.scale_idx.get())]
        self.run_btn.configure(state="disabled")
        self.progress.configure(value=0, maximum=n_draws)

        def worker():
            def on_progress(done, total):
                self._progress_queue.put(done)

            counter = generator.simulate_frequency(n_draws, on_progress=on_progress, progress_step=max(1, n_draws // 50))
            self.after(0, lambda: self._finish(counter))

        threading.Thread(target=worker, daemon=True).start()
        self._poll_progress()

    def _poll_progress(self):
        try:
            while True:
                done = self._progress_queue.get_nowait()
                self.progress.configure(value=done)
        except queue.Empty:
            pass
        if self.run_btn.cget("state") == "disabled":
            self.after(80, self._poll_progress)

    def _finish(self, counter):
        self.run_btn.configure(state="normal")
        xs = list(range(1, 46))
        ys = [counter[n] for n in xs]
        self.ax.clear()
        bars = self.ax.bar(xs, ys, color="#2E7DE1")
        self.ax.set_xlabel("번호")
        self.ax.set_ylabel("등장 횟수")
        self.ax.set_xlim(0.5, 45.5)
        self.ax.set_xticks(xs)
        self.ax.tick_params(axis="x", labelsize=6)
        self.ax.bar_label(bars, fontsize=6, padding=1)
        self.ax.margins(y=0.12)
        self.fig.tight_layout()
        self.canvas.draw()
