/**
 * 新着口コミ定時スクレーパー
 * jpnumber.com の新着口コミページを巡回し、未作成ページの番号を自動登録する
 *
 * 実行: node hourly_new_reviews.js
 * スケジュール: 毎日 9:00〜19:30、1.5時間おき8回（Task Scheduler）
 */

const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_BASE        = 'https://api.sagiden-search.com';
const API_SECRET      = 'sgd_2026_xK9mPqR4vLzN';
const NEW_REVIEWS_URL = 'https://www.jpnumber.com/newcomment/';
const LAST_SEEN_PATH  = path.join(__dirname, 'last_seen.json');
const DELAY_MS        = 2000;
const UNSCRAPED_LIMIT = 15; // 1回あたり最大処理件数
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

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// last_seen.json の読み込み
function loadLastSeen() {
  try {
    return new Set(JSON.parse(fs.readFileSync(LAST_SEEN_PATH, 'utf8')));
  } catch {
    return new Set();
  }
}

// last_seen.json の保存
function saveLastSeen(numbers) {
  fs.writeFileSync(LAST_SEEN_PATH, JSON.stringify([...numbers]));
}

// URLから電話番号を抽出（例: /freedial/numberinfo_0800_300_7022.html → 08003007022）
function extractNumber(url) {
  const m = url.match(/numberinfo_([0-9_]+)\.html/);
  if (!m) return null;
  return m[1].replace(/_/g, '');
}

// 新着口コミページから番号リストを取得
async function fetchNewReviewNumbers(page) {
  await page.goto(NEW_REVIEWS_URL, { waitUntil: 'domcontentloaded' });
  await sleep(DELAY_MS);

  const entries = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="numberinfo"]'))
      .filter(a => /^[\d]{10,11}$/.test(a.textContent.trim()))
      .map(a => ({
        number: a.textContent.trim(),
        url: a.href.replace(/#.*$/, ''), // フラグメント除去
      }));
  });

  // 重複除去（同じ番号が複数リンクされる場合）
  const seen = new Set();
  return entries.filter(e => {
    if (seen.has(e.number)) return false;
    seen.add(e.number);
    return true;
  });
}

// DBに番号が存在するか確認
async function existsInDb(number) {
  const res = await fetch(`${API_BASE}/api_exists.php?secret=${API_SECRET}&number=${number}`);
  const json = await res.json();
  return json.exists === true;
}

// 番号ページからコメントを取得（1ページのみ）
async function fetchComments(page, url, number) {
  log(`  コメント取得: ${number}`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await sleep(DELAY_MS);

  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('div.content.autonewline dt'))
      .map(dt => dt.innerText.trim())
      .filter(t => t.length > 0);
  });
}

async function main() {
  log('=== 新着口コミスクレーピング開始 ===');

  const lastSeen = loadLastSeen();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'ja-JP',
  });
  let page = await context.newPage();

  let newCount = 0;

  try {
    const entries = await fetchNewReviewNumbers(page);
    log(`新着ページに${entries.length}件の番号`);

    const currentNumbers = new Set(entries.map(e => e.number));

    for (const { number, url } of entries) {
      // ① 前回リストにある → スキップ
      if (lastSeen.has(number)) {
        continue;
      }

      // ② DBに既存 → スキップ
      const exists = await existsInDb(number);
      if (exists) {
        continue;
      }

      // ③ 新規番号 → コメント取得→登録
      log(`新規番号: ${number}`);
      const comments = await fetchComments(page, url, number);
      log(`  ${comments.length}件のコメント取得`);

      const postRes = await fetch(`${API_BASE}/api_scrape.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: API_SECRET,
          phone_number: number,
          comments,
          source: 'scraped',
          source_site: 'jpnumber.com',
          force_resummary: comments.length > 0,
        }),
      });
      const postJson = await postRes.json();
      log(`  API: ${JSON.stringify(postJson)}`);
      newCount++;

      await sleep(DELAY_MS);
    }

    // 今回の番号リストを保存
    saveLastSeen(currentNumbers);

    // 未スクレイプ番号の処理（ページ作成済み・コメント投稿済みだがjpnumber未取得の番号）
    try {
      const unscrapedRes = await fetch(`${API_BASE}/api_unscraped.php?secret=${API_SECRET}&limit=${UNSCRAPED_LIMIT}`);
      const unscrapedJson = await unscrapedRes.json();
      const unscrapedNumbers = unscrapedJson.data ?? [];
      if (unscrapedNumbers.length > 0) {
        log(`未スクレイプ番号: ${unscrapedNumbers.length}件`);
        for (const number of unscrapedNumbers) {
          const url = buildJpnumberUrl(number);
          let comments = [];
          if (url) {
            try {
              comments = await fetchComments(page, url, number);
              log(`  ${number}: ${comments.length}件取得`);
            } catch (e) {
              log(`  ${number}: スクレイプ失敗 (${e.message}) → ページ再生成`);
              try { await page.close(); } catch {}
              page = await context.newPage();
            }
          } else {
            log(`  ${number}: URL構築不可`);
          }
          await fetch(`${API_BASE}/api_scrape.php`, {
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
          newCount++;
          await sleep(DELAY_MS);
        }
      }
    } catch (e) {
      log(`未スクレイプ処理エラー: ${e.message}`);
    }

  } catch (e) {
    log(`エラー: ${e.message}`);
  } finally {
    await browser.close();
  }

  log(`=== 完了: 新規登録${newCount}件 ===`);

  if (newCount > 0) {
    log('--- AI要約パイプライン開始 ---');
    execSync('node summarize.js', { cwd: __dirname, stdio: 'inherit' });
  }
}

main();
