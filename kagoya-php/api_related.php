<?php
/**
 * 関連番号（近い番号）エンドポイント
 * GET /api_related.php?number=09012345678&limit=8
 *
 * 先頭桁が長く一致する番号（=同じ割当ブロック/同一業者の疑い）を、
 * 「共通プレフィックス長 → コメント数」の順で返す。DB内に既に存在する番号のみ。
 */
require_once __DIR__ . '/db.php';

$raw    = $_GET['number'] ?? '';
$number = normalize_phone($raw);
$limit  = min((int)($_GET['limit'] ?? 8), 20);

if ($number === '') {
    json_response(['status' => 'success', 'related' => []]);
}

$pdo  = get_db();
$stmt = $pdo->prepare(
    'SELECT phone_number, danger_rank, comment_count
     FROM sagiden_phone_numbers
     WHERE phone_number LIKE ? AND phone_number <> ?
     LIMIT 300'
);

// 長いプレフィックスから順に候補を集める（近いブロックを取りこぼさない）
$seen = [];
$rows = [];
foreach ([7, 5, 3] as $plen) {
    if (strlen($number) < $plen) continue;
    $stmt->execute([substr($number, 0, $plen) . '%', $number]);
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
        if (isset($seen[$r['phone_number']])) continue;
        $seen[$r['phone_number']] = true;
        $rows[] = $r;
    }
    if (count($rows) >= 60) break; // ランキングに十分な候補数
}

// 共通プレフィックス長
$lcp = function (string $a, string $b): int {
    $n = min(strlen($a), strlen($b));
    $i = 0;
    while ($i < $n && $a[$i] === $b[$i]) { $i++; }
    return $i;
};
foreach ($rows as &$r) {
    $r['_lcp'] = $lcp($number, $r['phone_number']);
    $r['_cc']  = (int)$r['comment_count'];
}
unset($r);

// 共通プレフィックス長 desc → コメント数 desc → 番号昇順
usort($rows, function ($x, $y) {
    if ($x['_lcp'] !== $y['_lcp']) return $y['_lcp'] - $x['_lcp'];
    if ($x['_cc']  !== $y['_cc'])  return $y['_cc']  - $x['_cc'];
    return strcmp($x['phone_number'], $y['phone_number']);
});

$related = [];
foreach (array_slice($rows, 0, $limit) as $r) {
    $related[] = [
        'number'        => $r['phone_number'],
        'danger_rank'   => $r['danger_rank'],
        'comment_count' => (int)$r['comment_count'],
    ];
}

json_response(['status' => 'success', 'related' => $related]);
