const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  // jpnumber.comで1位だった番号で試す
  await page.goto('https://www.telnavi.jp/phone/05031657530', { waitUntil: 'domcontentloaded' });
  console.log('title:', await page.title());
  console.log('status OK');

  // コメント構造を確認
  const data = await page.evaluate(() => {
    // ランキングページがあるか
    const rankLinks = Array.from(document.querySelectorAll('a')).filter(a => /rank|人気|週間/.test(a.href+a.textContent)).map(a=>({text:a.textContent.trim(),href:a.href}));

    // コメント要素を探す
    const commentCandidates = Array.from(document.querySelectorAll('*'))
      .filter(e => e.children.length === 0 && e.innerText?.trim().length > 20)
      .slice(0, 30)
      .map(e => ({tag: e.tagName, class: e.className, text: e.innerText.trim().substring(0,100)}));

    return { rankLinks, commentCandidates };
  });

  console.log('rankLinks:', JSON.stringify(data.rankLinks));
  console.log('candidates:', JSON.stringify(data.commentCandidates, null, 2));

  await browser.close();
})();
