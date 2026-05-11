/**
 * jpnumber.com スクレーパー
 * 週1回実行。ランキングTOP20の番号のコメントを取得してKAGOYA APIに送る。
 *
 * 実行方法: node scrape_jpnumber.js
 */

const { chromium } = require('playwright');

const API_BASE = 'https://api.sagiden-search.com';
const API_SECRET = 'sgd_2026_xK9mPqR4vLzN';
const MAX_PAGES_PER_NUMBER = 3;   // コメント最大3ページ（約60件）で足切り
const DELAY_MS = 2000;            // リクエスト間隔（サーバー負荷軽減）

// ミリ秒待機
const sleep = ms => new Promise(r => setTimeout(r, ms));

// URLから電話番号を抽出（例: /freedial/numberinfo_0120_429_313.html → 0120429313）
function extractNumber(url) {
  const m = url.match(/numberinfo_([0-9_]+)\.html/);
  if (!m) return null;
  return m[1].replace(/_/g, '');
}

// ランキングページからTOP20の番号リストを取得
async function fetchRanking(page) {
  console.log('ランキング取得中...');
  await page.goto('https://www.jpnumber.com/', { waitUntil: 'domcontentloaded' });
  await sleep(DELAY_MS);

  const rankings = await page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('table')).filter(t => t.innerText.includes('位'));
    return tables.map(t => {
      const rows = Array.from(t.querySelectorAll('tr')).map(tr => tr.innerText.trim()).filter(x => x);
      const link = t.querySelector('a');
      const rankText = rows[0] || '';
      const rankMatch = rankText.match(/第(\d+)位\s+([\d,]+)(回|個)/);
      return {
        rank: rankMatch ? parseInt(rankMatch[1]) : null,
        count: rankMatch ? parseInt(rankMatch[2].replace(',', '')) : 0,
        type: rankMatch ? (rankMatch[3] === '回' ? 'access' : 'comment') : null,
        label: rows[1] || '',
        url: link ? link.href : null,
      };
    }).filter(r => r.rank && r.url);
  });

  // 重複番号を除去して番号リストを返す
  const seen = new Set();
  const result = [];
  for (const r of rankings) {
    const number = extractNumber(r.url);
    if (number && !seen.has(number)) {
      seen.add(number);
      result.push({ ...r, number });
    }
  }
  console.log(`ランキング取得完了: ${result.length}件`);
  return result;
}

// 個別番号ページからコメントを取得（最大MAX_PAGES_PER_NUMBERページ）
async function fetchComments(page, numberUrl, number) {
  const comments = [];

  for (let p = 1; p <= MAX_PAGES_PER_NUMBER; p++) {
    const url = p === 1 ? numberUrl : `${numberUrl}?p=${p}`;
    console.log(`  コメント取得: ${number} p=${p}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await sleep(DELAY_MS);

    const pageComments = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div.content.autonewline dt'))
        .map(dt => dt.innerText.trim())
        .filter(t => t.length > 0);
    });

    if (pageComments.length === 0) break;
    comments.push(...pageComments);

    // 次ページがなければ終了
    const hasNext = await page.evaluate(p => {
      return !!document.querySelector(`a[href*="?p=${p + 1}"]`);
    }, p);
    if (!hasNext) break;
  }

  return comments;
}

// KAGOYA APIにデータを送信
async function postToApi(number, comments) {
  const body = JSON.stringify({
    secret: API_SECRET,
    phone_number: number,
    comments,
    source: 'scraped',
    source_site: 'jpnumber.com',
  });

  const res = await fetch(`${API_BASE}/api_scrape.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const json = await res.json();
  return json;
}

// メイン処理
async function main() {
  console.log('=== スクレーピング開始 ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'ja-JP',
  });
  const page = await context.newPage();

  try {
    const rankings = await fetchRanking(page);

    for (const entry of rankings) {
      console.log(`処理中: ${entry.number} (${entry.label})`);
      const comments = await fetchComments(page, entry.url, entry.number);
      console.log(`  コメント${comments.length}件取得`);

      if (comments.length > 0) {
        const result = await postToApi(entry.number, comments);
        console.log(`  API送信: ${JSON.stringify(result)}`);
      }

      await sleep(DELAY_MS);
    }
  } catch (e) {
    console.error('エラー:', e);
  } finally {
    await browser.close();
  }

  console.log('=== スクレーピング完了 ===');

  // スクレーピング直後にAI要約を実行
  console.log('\n--- AI要約パイプライン開始 ---');
  const { execSync } = require('child_process');
  execSync('node summarize.js', { cwd: __dirname, stdio: 'inherit' });
}

main();
