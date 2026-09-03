import subprocess
import os

BASE = r"C:\Users\kimna\source\repos\honest-lotto645\scripts\capture"
OUT_DIR = os.path.join(BASE, "video_raw", "clips_a")
os.makedirs(OUT_DIR, exist_ok=True)

FONT_BD = r"C:\Windows\Fonts\malgunbd.ttf".replace("\\", "/").replace(":", "\\:")


def esc(p):
    return p.replace("\\", "/").replace(":", "\\:")


CAP = lambda name: esc(os.path.join(BASE, "captions", f"{name}.txt"))

MASTER = os.path.join(BASE, "video_raw", "master.mp4")

clips = [
    ("clip1.mp4", 13.0, 5.0, "a1"),
    ("clip2.mp4", 19.0, 3.9, "a2"),
    ("clip3.mp4", 29.0, 5.9, "a3"),
]

for name, start, dur, cap in clips:
    out = os.path.join(OUT_DIR, name)
    vf = (
        "scale=1080:2338,"
        f"drawtext=fontfile='{FONT_BD}':textfile='{CAP(cap)}':fontcolor=white:fontsize=46:"
        f"box=1:boxcolor=black@0.6:boxborderw=26:x=(w-text_w)/2:y=h-260"
    )
    cmd = [
        "ffmpeg", "-y",
        "-ss", str(start), "-t", str(dur), "-i", MASTER,
        "-vf", vf,
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium",
        out,
    ]
    subprocess.run(cmd, check=True)
    print("built", name)

# ---- 아웃트로 카드 (정지 화면, 3초) ----
outro = os.path.join(OUT_DIR, "outro.mp4")
vf_outro = (
    "drawtext=fontfile='{f}':textfile='{t1}':fontcolor=white:fontsize=90:"
    "x=(w-text_w)/2:y=(h/2)-80,"
    "drawtext=fontfile='{f}':textfile='{t2}':fontcolor=white:fontsize=44:"
    "x=(w-text_w)/2:y=(h/2)+40"
).format(f=FONT_BD, t1=CAP("outro1"), t2=CAP("outro2"))
cmd = [
    "ffmpeg", "-y",
    "-f", "lavfi", "-i", "color=c=0x1a1f2b:s=1080x2338:d=3",
    "-vf", vf_outro,
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20",
    outro,
]
subprocess.run(cmd, check=True)
print("built outro")

# ---- concat ----
list_path = os.path.join(OUT_DIR, "list.txt")
with open(list_path, "w", encoding="utf-8") as f:
    for name, *_ in clips:
        f.write(f"file '{os.path.join(OUT_DIR, name)}'\n")
    f.write(f"file '{outro}'\n")

final_out = os.path.join(BASE, "..", "..", "docs", "videos", "emphasis.mp4")
cmd = [
    "ffmpeg", "-y",
    "-f", "concat", "-safe", "0", "-i", list_path,
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20",
    final_out,
]
subprocess.run(cmd, check=True)
print("DONE:", final_out)
