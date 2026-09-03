import datetime as dt
import threading
import queue
from collections import Counter
import tkinter as tk

import ttkbootstrap as ttk
from ui import mpl_setup  # noqa: F401  (한글 폰트 설정 적용)
from matplotlib.figure import Figure
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

from lotto import api
from ui.widgets import ScrollableFrame


class Tab4Frequency(ttk.Frame):
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
        ttk.Label(body, text="실제 결과 빈도 분석", font=("Segoe UI", 15, "bold")).pack(anchor="w")
        ttk.Label(
            body,
            text="과거 빈도는 통계적으로 다음 회차 예측에 영향을 주지 않습니다.",
            foreground="#E5433D",
            font=("Segoe UI", 10, "bold"),
        ).pack(anchor="w", pady=(2, 12))

        self.mode = tk.StringVar(value="round")
        mode_row = ttk.Frame(body)
        mode_row.pack(anchor="w")
        ttk.Radiobutton(mode_row, text="회차 범위", variable=self.mode, value="round",
                         command=self._refresh_inputs).pack(side="left")
        ttk.Radiobutton(mode_row, text="날짜 범위", variable=self.mode, value="date",
                         command=self._refresh_inputs).pack(side="left", padx=(12, 0))

        self.input_area = ttk.Frame(body, padding=(0, 10))
        self.input_area.pack(anchor="w", fill="x")

        latest = api.estimate_latest_round()
        self.start_round_var = tk.IntVar(value=max(1, latest - 51))
        self.end_round_var = tk.IntVar(value=latest)
        self.start_date_var = tk.StringVar(value=str(dt.date.today() - dt.timedelta(weeks=52)))
        self.end_date_var = tk.StringVar(value=str(dt.date.today()))
        self._latest_round = latest

        self._refresh_inputs()

        self.fetch_btn = ttk.Button(body, text="조회", bootstyle="primary", command=self.fetch)
        self.fetch_btn.pack(anchor="w", pady=(6, 4))

        self.progress = ttk.Progressbar(body, mode="determinate", length=300)
        self.progress.pack(anchor="w", pady=(0, 4))
        self.status_label = ttk.Label(body, text="", foreground="#888888")
        self.status_label.pack(anchor="w", pady=(0, 8))

        chart_row = ttk.Frame(body)
        chart_row.pack(fill="both", expand=True)

        lists_frame = ttk.Frame(chart_row, padding=(16, 0, 0, 0), width=200)
        lists_frame.pack(side="right", fill="y")
        lists_frame.pack_propagate(False)

        self.fig = Figure(figsize=(8.0, 3.2), dpi=100)
        self.ax = self.fig.add_subplot(111)
        self.ax.set_xlabel("번호")
        self.ax.set_ylabel("등장 횟수")
        self.ax.set_xticks(range(1, 46))
        self.ax.tick_params(axis="x", labelsize=6)
        self.canvas = FigureCanvasTkAgg(self.fig, master=chart_row)
        self.canvas.get_tk_widget().pack(side="left", fill="both", expand=True)

        ttk.Label(lists_frame, text="빈도 상위 10개", font=("Segoe UI", 10, "bold")).pack(anchor="w")
        self.top_label = ttk.Label(lists_frame, text="-", justify="left")
        self.top_label.pack(anchor="w", pady=(0, 10))

        ttk.Label(lists_frame, text="빈도 하위 10개", font=("Segoe UI", 10, "bold")).pack(anchor="w")
        self.bottom_label = ttk.Label(lists_frame, text="-", justify="left")
        self.bottom_label.pack(anchor="w")

    def _refresh_inputs(self):
        for w in self.input_area.winfo_children():
            w.destroy()

        if self.mode.get() == "round":
            ttk.Label(self.input_area, text="시작 회차").pack(side="left")
            ttk.Spinbox(self.input_area, from_=1, to=self._latest_round, width=8,
                        textvariable=self.start_round_var).pack(side="left", padx=(4, 12))
            ttk.Label(self.input_area, text="종료 회차").pack(side="left")
            ttk.Spinbox(self.input_area, from_=1, to=self._latest_round, width=8,
                        textvariable=self.end_round_var).pack(side="left", padx=(4, 0))
        else:
            ttk.Label(self.input_area, text="시작일").pack(side="left")
            date_start = ttk.DateEntry(
                self.input_area, dateformat="%Y-%m-%d",
                startdate=dt.date.today() - dt.timedelta(weeks=52),
            )
            date_start.pack(side="left", padx=(4, 12))
            self._date_start_widget = date_start

            ttk.Label(self.input_area, text="종료일").pack(side="left")
            date_end = ttk.DateEntry(self.input_area, dateformat="%Y-%m-%d", startdate=dt.date.today())
            date_end.pack(side="left", padx=(4, 0))
            self._date_end_widget = date_end

    def fetch(self):
        if self.mode.get() == "round":
            start_r = self.start_round_var.get()
            end_r = self.end_round_var.get()
        else:
            try:
                start_d = self._date_start_widget.entry.get()
                end_d = self._date_end_widget.entry.get()
                start_date = dt.datetime.strptime(start_d, "%Y-%m-%d").date()
                end_date = dt.datetime.strptime(end_d, "%Y-%m-%d").date()
            except (ValueError, AttributeError):
                self.status_label.configure(text="날짜 형식이 올바르지 않습니다 (YYYY-MM-DD).")
                return
            start_r, end_r = api.date_range_to_round_range(start_date, end_date)

        if start_r > end_r or start_r < 1:
            self.status_label.configure(text="회차 범위가 올바르지 않습니다.")
            return

        self.fetch_btn.configure(state="disabled")
        total = end_r - start_r + 1
        self.progress.configure(value=0, maximum=total)
        self.status_label.configure(text=f"조회 중... (0/{total})")

        def worker():
            def on_progress(done, tot):
                self._progress_queue.put((done, tot))

            draws = api.fetch_draws_range(start_r, end_r, on_progress=on_progress)
            self.after(0, lambda: self._finish(draws, total))

        threading.Thread(target=worker, daemon=True).start()
        self._poll_progress()

    def _poll_progress(self):
        try:
            while True:
                done, total = self._progress_queue.get_nowait()
                self.progress.configure(value=done)
                self.status_label.configure(text=f"조회 중... ({done}/{total})")
        except queue.Empty:
            pass
        if self.fetch_btn.cget("state") == "disabled":
            self.after(80, self._poll_progress)

    def _finish(self, draws, requested_total):
        self.fetch_btn.configure(state="normal")
        if not draws:
            self.status_label.configure(text="조회된 결과가 없습니다. (인터넷 연결을 확인해주세요)")
            return

        counter = Counter({n: 0 for n in range(1, 46)})
        for d in draws:
            counter.update(d["numbers"])

        self.status_label.configure(text=f"{len(draws)}개 회차 조회 완료 (요청 {requested_total}개 중)")

        xs = list(range(1, 46))
        ys = [counter[n] for n in xs]
        self.ax.clear()
        bars = self.ax.bar(xs, ys, color="#E5433D")
        self.ax.set_xlabel("번호")
        self.ax.set_ylabel("등장 횟수")
        self.ax.set_xlim(0.5, 45.5)
        self.ax.set_xticks(xs)
        self.ax.tick_params(axis="x", labelsize=6)
        self.ax.bar_label(bars, fontsize=6, padding=1)
        self.ax.margins(y=0.12)
        self.fig.tight_layout()
        self.canvas.draw()

        ranked = sorted(counter.items(), key=lambda kv: (-kv[1], kv[0]))
        top10 = ranked[:10]
        bottom10 = sorted(counter.items(), key=lambda kv: (kv[1], kv[0]))[:10]

        self.top_label.configure(text="\n".join(f"{n}번 ({c}회)" for n, c in top10))
        self.bottom_label.configure(text="\n".join(f"{n}번 ({c}회)" for n, c in bottom10))
