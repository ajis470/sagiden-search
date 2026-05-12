<?php
// jpnumber.comへのcurlアクセステスト
$url = 'https://www.jpnumber.com/freedial/numberinfo_0120_531_101.html';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language: ja,en-US;q=0.7,en;q=0.3',
]);

$html = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTPステータス: $httpCode\n";
echo "curlエラー: " . ($error ?: 'なし') . "\n";
echo "レスポンスサイズ: " . strlen($html) . " bytes\n";

if ($html) {
    // Cloudflareチェック
    if (strpos($html, 'Just a moment') !== false || strpos($html, 'cf-browser-verification') !== false) {
        echo "結果: Cloudflareで弾かれた\n";
    } else {
        // コメント抽出テスト
        preg_match_all('/<div class="content autonewline">\s*<dt>([\s\S]*?)<\/dt>/u', $html, $matches);
        $comments = array_map(function($m) {
            return trim(preg_replace('/<[^>]+>/', '', $m));
        }, $matches[1]);
        $comments = array_filter($comments, function($c) { return mb_strlen($c) >= 5; });
        echo "結果: 取得成功\n";
        echo "コメント件数: " . count($comments) . "\n";
        foreach (array_slice($comments, 0, 3) as $i => $c) {
            echo ($i+1) . ". " . mb_substr($c, 0, 50) . "\n";
        }
    }
}
