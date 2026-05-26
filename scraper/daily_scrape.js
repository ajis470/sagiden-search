/**
 * 日次スクレーパー
 * スクレイプ未完了の番号をjpnumber.comから取得してDBに保存し、AI要約を生成する
 *
 * 実行方法: node daily_scrape.js
 */

const { chromium } = require('playwright');
const { execSync } = require('child_process');

const API_BASE   = 'https://api.sagiden-search.com';
const API_SECRET = 'sgd_2026_xK9mPqR4vLzN';
const DELAY_MS   = 2000;
const LIMIT      = 50;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function buildJpnumberUrl(number) {
  if (number.length === 11 && /^(090|080|070|050)/.test(number)) {
    return `https://www.jpnumber.com/numberinfo_${number.slice(0,3)}_${number.slice(3,7)}_${number.slice(7)}.html`;
  }
  if (number.length === 10 && /^(0120|0800|0570|0990)/.test(number)) {
    return `https://www.jpnumber.com/freedial/numberinfo_${number.slice(0,4)}_${number.slice(4,7)}_${number.slice(7)}.html`;
  }
  if (number.length === 10 && number.startsWith('0')) {
    if (/^(03|06)/.test(number)) {
      return `https://www.jpnumber.com/numberinfo_${number.slice(0,2)}_${number.slice(2,6)}_${number.slice(6)}.html`;
    }
    if (/^(011|017|018|019|022|023|024|025|026|027|028|029|042|043|044|045|046|047|048|049|052|053|054|055|058|059|072|073|074|075|076|077|078|079|082|083|084|086|087|088|089|092|093|095|096|097|098|099)/.test(number)) {
      return `https://www.jpnumber.com/numberinfo_${number.slice(0,3)}_${number.slice(3,6)}_${number.slice(6)}.html`;
    }
    return `https://www.jpnumber.com/numberinfo_${number.slice(0,4)}_${number.slice(4,6)}_${number.slice(6)}.html`;
  }
  return null;
}

async function fetchComments(page, url, number) {
  const comments = [];
  for (let p = 1; p <= 3; p++) {
    const pageUrl = p === 1 ? url : `${url}?p=${p}`;
    console.log(`  コメント取得: ${number} p=${p}`);
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
    await sleep(DELAY_MS);

    const pageComments = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div.content.autonewline dt'))
        .map(dt => dt.innerText.trim())
        .filter(t => t.length > 0);
    });

    if (pageComments.length === 0) break;
    comments.push(...pageComments);

    const hasNext = await page.evaluate(p => {
      return !!document.querySelector(`a[href*="?p=${p + 1}"]`);
    }, p);
    if (!hasNext) break;
  }
  return comments;
}

async function main() {
  console.log('=== 日次スクレーピング開始 ===');

  // スクレイプ未完了の番号を取得
  const res = await fetch(`${API_BASE}/api_unscraped.php?secret=${API_SECRET}&limit=${LIMIT}`);
  const json = await res.json();

  if (json.status !== 'success' || json.data.length === 0) {
    console.log('スクレイプ対象の番号はありません');
    return;
  }

  console.log(`${json.data.length}件を処理します`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'ja-JP',
  });
  let page = await context.newPage();

  try {
    for (const number of json.data) {
      const url = buildJpnumberUrl(number);
      if (!url) {
        console.log(`${number}: URL構築不可、スキップ`);
        // force_resummary のみセット（既存コメントで要約）
        await fetch(`${API_BASE}/api_scrape.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: API_SECRET,
            phone_number: number,
            comments: [],
            source: 'scraped',
            source_site: 'jpnumber.com',
            force_resummary: true,
          }),
        });
        continue;
      }

      console.log(`処理中: ${number}`);
      let comments = [];
      try {
        comments = await fetchComments(page, url, number);
      } catch (e) {
        console.error(`  クラッシュ: ${e.message} → ページ再生成して続行`);
        // クラッシュしたページを捨てて新しいページを作り直す
        try { await page.close(); } catch {}
        page = await context.newPage();
        // この番号はスキップせず空コメントでforce_resummaryだけセット
      }
      console.log(`  ${comments.length}件取得`);

      const postRes = await fetch(`${API_BASE}/api_scrape.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: API_SECRET,
          phone_number: number,
          comments,
          source: 'scraped',
          source_site: 'jpnumber.com',
          force_resummary: true,
        }),
      });
      const postJson = await postRes.json();
      console.log(`  API: ${JSON.stringify(postJson)}`);

      await sleep(DELAY_MS);
    }
  } catch (e) {
    console.error('エラー:', e);
  } finally {
    await browser.close();
  }

  console.log('=== 日次スクレーピング完了 ===');

  console.log('\n--- AI要約パイプライン開始 ---');
  execSync('node summarize.js', { cwd: __dirname, stdio: 'inherit' });
}

main();
