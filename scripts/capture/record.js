const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const VIDEO_DIR = path.join(__dirname, "video_raw");
fs.mkdirSync(VIDEO_DIR, { recursive: true });
for (const f of fs.readdirSync(VIDEO_DIR)) fs.unlinkSync(path.join(VIDEO_DIR, f));

async function clickText(page, text) {
  const point = await page.evaluate((targetText) => {
    function isInAriaHidden(el) {
      let n = el;
      while (n) {
        if (n.getAttribute && n.getAttribute("aria-hidden") === "true") return true;
        n = n.parentElement;
      }
      return false;
    }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim() === targetText && !isInAriaHidden(node.parentElement)) {
        const el = node.parentElement;
        let rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          if (
            rect.top < 0 ||
            rect.bottom > window.innerHeight ||
            rect.left < 0 ||
            rect.right > window.innerWidth
          ) {
            el.scrollIntoView({ block: "center", inline: "center" });
            rect = el.getBoundingClientRect();
          }
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
      }
    }
    return null;
  }, text);
  if (!point) throw new Error(`No on-screen element with text: ${text}`);
  await page.mouse.move(point.x, point.y, { steps: 8 });
  await page.mouse.click(point.x, point.y);
  console.log(`  clicked "${text}" at`, point);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    recordVideo: { dir: VIDEO_DIR, size: { width: 390, height: 844 } },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:8081", { waitUntil: "networkidle" });
  await sleep(1500);

  // ---- Tab1 번호 생성 ----
  await clickText(page, "번호 뽑기");
  await sleep(2500);
  await clickText(page, "번호 뽑기");
  await sleep(2500);

  // ---- Tab2 자동완성 ----
  await clickText(page, "자동완성");
  await sleep(800);
  await clickText(page, "3");
  await sleep(200);
  await clickText(page, "17");
  await sleep(200);
  await clickText(page, "28");
  await sleep(300);
  await clickText(page, "나머지 추천받기");
  await sleep(2800);

  // ---- Tab3 무작위성 실험 ----
  await clickText(page, "무작위성 실험");
  await sleep(800);
  await clickText(page, "시뮬레이션 실행");
  await sleep(3200);

  // ---- Tab7 추천 조합 (강조 영상용으로 먼저 촬영) ----
  await clickText(page, "추천 조합");
  await sleep(800);
  await clickText(page, "추천 조합 생성");
  await sleep(4500);

  // ---- Tab5 등수 시뮬레이터 ----
  await clickText(page, "등수 시뮬레이터");
  await sleep(800);
  for (const n of ["1", "2", "3", "8", "16", "25"]) {
    await clickText(page, n);
    await sleep(150);
  }
  await clickText(page, "결과 확인");
  await sleep(3000);

  // ---- Tab6 회차 결과 확인 ----
  await clickText(page, "회차 결과 확인");
  await sleep(800);
  for (const n of ["11", "13", "22", "32", "33", "36"]) {
    await clickText(page, n);
    await sleep(150);
  }
  const roundInputs = await page.locator('input[type="text"], input:not([type])').all();
  for (const inp of roundInputs) {
    if (await inp.isVisible()) {
      await inp.fill("1239");
      break;
    }
  }
  await clickText(page, "결과 확인");
  await sleep(3500);

  // ---- Tab4 빈도 분석 ----
  await clickText(page, "빈도 분석");
  await sleep(800);
  {
    const numInputs = await page.locator('input[type="text"], input:not([type])').all();
    const visibles = [];
    for (const inp of numInputs) {
      if (await inp.isVisible()) visibles.push(inp);
    }
    if (visibles.length >= 2) {
      await visibles[0].fill("1188");
      await visibles[1].fill("1239");
    }
  }
  await sleep(300);
  await clickText(page, "조회");
  await sleep(5500);

  await sleep(1000);
  await context.close();
  await browser.close();

  const files = fs.readdirSync(VIDEO_DIR);
  console.log("recorded:", files);
})();
