import subprocess

BASE = r"C:\Users\kimna\source\repos\honest-lotto645\scripts\capture"
FONT = r"C:\Windows\Fonts\malgunbd.ttf".replace("\\", "/").replace(":", "\\:")
CAP = lambda n: (BASE + rf"\captions\c{n}.txt").replace("\\", "/").replace(":", "\\:")

segments = [
    (1, 0.5, 7.5),
    (2, 8.3, 12.6),
    (3, 13.3, 18.0),
    (4, 19.0, 22.6),
    (5, 23.3, 28.6),
    (6, 29.3, 34.6),
    (7, 35.3, 43.5),
]

filters = ["scale=1080:2338"]
for n, start, end in segments:
    filters.append(
        f"drawtext=fontfile='{FONT}':textfile='{CAP(n)}':fontcolor=white:fontsize=42:"
        f"box=1:boxcolor=black@0.55:boxborderw=22:x=(w-text_w)/2:y=h-230:"
        f"enable='between(t,{start},{end})'"
    )
vf = ",".join(filters)

cmd = [
    "ffmpeg", "-y",
    "-i", BASE + r"\video_raw\master.mp4",
    "-vf", vf,
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium",
    BASE + r"\..\..\docs\videos\features_walkthrough.mp4",
]

print(" ".join(cmd))
subprocess.run(cmd, check=True)
