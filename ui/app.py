import ttkbootstrap as tb
from ttkbootstrap.constants import *  # noqa: F401,F403

from ui.theme import LIGHT_THEME_NAME, DARK_THEME_NAME
from ui.tab1_generate import Tab1Generate
from ui.tab2_autocomplete import Tab2Autocomplete
from ui.tab3_randomness import Tab3Randomness
from ui.tab4_frequency import Tab4Frequency
from ui.tab5_rank_simulator import Tab5RankSimulator
from ui.tab6_check_result import Tab6CheckResult
from ui.tab7_ai_recommend import Tab7AiRecommend

GLOBAL_DISCLAIMER = (
    "본 프로그램은 실제 당첨을 예측하는 기능이 아니라, 무작위성 학습·데이터 분석·재미를 "
    "목적으로 합니다. 매크로/자동 구매 기능을 제공하지 않습니다."
)


class LottoApp(tb.Window):
    def __init__(self):
        super().__init__(title="로또 6/45 번호 생성 및 데이터 분석", themename=LIGHT_THEME_NAME)
        self.geometry("980x760")
        self.minsize(760, 600)
        self._is_dark = False
        self._build()

    def _build(self):
        header = tb.Frame(self, padding=(16, 12))
        header.pack(fill="x")

        title_box = tb.Frame(header)
        title_box.pack(side="left", fill="x", expand=True)
        tb.Label(title_box, text="로또 6/45 번호 생성 및 데이터 분석", font=("Segoe UI", 16, "bold")).pack(
            anchor="w"
        )
        tb.Label(title_box, text=GLOBAL_DISCLAIMER, foreground="#888888", wraplength=760).pack(
            anchor="w", pady=(2, 0)
        )

        self.theme_btn = tb.Button(
            header, text="다크 모드", bootstyle="secondary-outline", command=self.toggle_theme
        )
        self.theme_btn.pack(side="right")

        notebook = tb.Notebook(self, padding=(8, 4))
        notebook.pack(fill="both", expand=True, padx=12, pady=(0, 12))

        tabs = [
            ("번호 생성", Tab1Generate),
            ("번호 자동완성", Tab2Autocomplete),
            ("무작위성 실험", Tab3Randomness),
            ("실제 결과 빈도 분석", Tab4Frequency),
            ("등수 시뮬레이터", Tab5RankSimulator),
            ("회차 결과 확인", Tab6CheckResult),
            ("추천 조합", Tab7AiRecommend),
        ]
        for label, tab_cls in tabs:
            frame = tab_cls(notebook)
            notebook.add(frame, text=label)

    def toggle_theme(self):
        self._is_dark = not self._is_dark
        theme_name = DARK_THEME_NAME if self._is_dark else LIGHT_THEME_NAME
        self.style.theme_use(theme_name)
        self.theme_btn.configure(text="라이트 모드" if self._is_dark else "다크 모드")
