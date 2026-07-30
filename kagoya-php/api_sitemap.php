<?php
require_once __DIR__ . '/db.php';

// 認証
$secret = $_SERVER['HTTP_X_API_SECRET'] ?? '';
if ($secret !== API_SECRET) {
    json_response(['error' => 'Unauthorized'], 401);
}

$pdo = get_db();

// 中身がある番号だけ返す（AI要約あり、または公開済みユーザー投稿がある）
// 判定中だけの薄いページをGoogleに大量送信しない（AdSense「有用性の低いコンテンツ」対策）
$stmt = $pdo->query("
    SELECT DISTINCT pn.phone_number, pn.updated_at
    FROM sagiden_phone_numbers pn
    WHERE pn.danger_rank IS NOT NULL
       OR EXISTS (
            SELECT 1 FROM sagiden_comments c
            WHERE c.phone_number_id = pn.id AND c.source = 'user' AND c.status = 'published'
       )
    ORDER BY pn.updated_at DESC
");

$numbers = $stmt->fetchAll(PDO::FETCH_ASSOC);

json_response([
    'count' => count($numbers),
    'numbers' => array_map(fn($r) => [
        'number' => $r['phone_number'],
        'updated_at' => $r['updated_at'],
    ], $numbers),
]);
