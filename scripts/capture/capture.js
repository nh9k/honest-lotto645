const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "..", "docs", "screenshots", "mobile");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function clickVisibleText(page, text) {
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
        const rect = node.parentElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
      }
    }
    return null;
  }, text);
  if (!point) throw new Error(`No on-screen element with text: ${text}`);
  await page.mouse.click(point.x, point.y);
}

async function clickVisibleNumberCell(page, num) {
  // 번호 그리드 셀: 정확히 숫자만 있는 visible 텍스트 요소
  return clickVisibleText(page, String(num), true);
}

async function shot(page, name) {
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT_DIR, name) });
  console.log("saved", name);
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 1700 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
  await page.goto("http://localhost:8081", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // ---- Tab1 번호 생성 ----
  await clickVisibleText(page, "번호 뽑기");
  await shot(page, "tab1_generate.png");

  // ---- Tab2 자동완성 ----
  await clickVisibleText(page, "자동완성");
  await page.waitForTimeout(700);
  await clickVisibleNumberCell(page, 3);
  await clickVisibleNumberCell(page, 17);
  await clickVisibleNumberCell(page, 28);
  await clickVisibleText(page, "나머지 추천받기");
  await shot(page, "tab2_autocomplete.png");

  // ---- Tab3 무작위성 실험 ----
  await clickVisibleText(page, "무작위성 실험");
  await page.waitForTimeout(700);
  await clickVisibleText(page, "시뮬레이션 실행");
  await page.waitForTimeout(1500);
  await shot(page, "tab3_randomness.png");

  // ---- Tab4 빈도 분석 ----
  await clickVisibleText(page, "빈도 분석");
  await page.waitForTimeout(700);
  await clickVisibleText(page, "조회");
  await page.waitForTimeout(4000);
  await shot(page, "tab4_frequency.png");

  // ---- Tab5 등수 시뮬레이터 ----
  await clickVisibleText(page, "등수 시뮬레이터");
  await page.waitForTimeout(700);
  for (const n of [1, 2, 3, 8, 16, 25]) {
    await clickVisibleNumberCell(page, n);
  }
  await clickVisibleText(page, "결과 확인");
  await shot(page, "tab5_rank_simulator.png");

  // ---- Tab6 회차 결과 확인 ----
  await clickVisibleText(page, "회차 결과 확인");
  await page.waitForTimeout(700);
  for (const n of [11, 13, 22, 32, 33, 36]) {
    await clickVisibleNumberCell(page, n);
  }
  const roundInputs = await page.locator('input[type="text"], input:not([type])').all();
  for (const inp of roundInputs) {
    if (await inp.isVisible()) {
      await inp.fill("1239");
      break;
    }
  }
  await clickVisibleText(page, "결과 확인");
  await page.waitForTimeout(3000);
  await shot(page, "tab6_check_result.png");

  // ---- Tab7 추천 조합 ----
  await clickVisibleText(page, "추천 조합");
  await page.waitForTimeout(700);
  await clickVisibleText(page, "추천 조합 생성");
  await page.waitForTimeout(4000);
  await shot(page, "tab7_ai_recommend.png");

  await browser.close();
  console.log("DONE");
})();
