"""matplotlib에서 한글이 깨지지 않도록 폰트를 설정 (import 시 1회 적용)."""
import matplotlib

matplotlib.rcParams["font.family"] = "Malgun Gothic"
matplotlib.rcParams["axes.unicode_minus"] = False
