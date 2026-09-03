import sys
import os
import ctypes

try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)  # PROCESS_PER_MONITOR_DPI_AWARE
except Exception:
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from PIL import ImageGrab
from ui.app import LottoApp

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "docs", "screenshots")
os.makedirs(OUT_DIR, exist_ok=True)

app = LottoApp()
app.attributes("-topmost", True)

nb = None
panes = []


def find_notebook(w):
    for c in w.winfo_children():
        if c.winfo_class() == "TNotebook":
            return c
        r = find_notebook(c)
        if r:
            return r
    return None


def capture(name):
    app.update_idletasks()
    app.update()
    x = app.winfo_rootx()
    y = app.winfo_rooty()
    w = app.winfo_width()
    h = app.winfo_height()
    img = ImageGrab.grab(bbox=(x, y, x + w, y + h))
    img.save(os.path.join(OUT_DIR, name))
    print("saved", name)


def setup():
    global nb, panes
    nb = find_notebook(app)
    panes = [nb.nametowidget(t) for t in nb.tabs()]
    step_tab1()


def step_tab1():
    nb.select(0)
    panes[0].draw()
    app.after(300, lambda: (capture("tab1_generate.png"), step_tab2()))


def step_tab2():
    nb.select(1)
    t = panes[1]
    for n in [3, 17, 28]:
        t.grid.toggle(n)
    t.recommend()
    app.after(300, lambda: (capture("tab2_autocomplete.png"), step_tab3()))


def step_tab3():
    nb.select(2)
    t = panes[2]
    t.scale_idx.set(1)  # 1,000회
    t._on_scale_move(None)
    t.run()
    app.after(2500, lambda: (capture("tab3_randomness.png"), step_tab4()))


def step_tab4():
    nb.select(3)
    t = panes[3]
    t.start_round_var.set(1230)
    t.end_round_var.set(1239)
    t.fetch()
    app.after(3000, lambda: (capture("tab4_frequency.png"), step_tab5()))


def step_tab5():
    nb.select(4)
    t = panes[4]
    win = t.win_numbers
    others = [n for n in range(1, 46) if n not in win]
    picks = win[:3] + others[:3]
    for n in picks:
        t.grid.toggle(n)
    t.check()
    app.after(300, lambda: (capture("tab5_rank_simulator.png"), step_tab6()))


def step_tab6():
    nb.select(5)
    t = panes[5]
    t.round_var.set(1239)
    for n in [11, 13, 22, 32, 33, 36]:  # 실제 1239회 당첨번호
        t.grid.toggle(n)
    t.check()
    app.after(2500, lambda: (capture("tab6_check_result.png"), step_tab7()))


def step_tab7():
    nb.select(6)
    t = panes[6]
    t.n_var.set(20)
    t.generate()
    app.after(3000, lambda: (capture("tab7_ai_recommend.png"), finish()))


def finish():
    app.destroy()
    print("DONE")


app.after(300, setup)
app.mainloop()
