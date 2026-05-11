<?php
require_once __DIR__ . '/db.php';

// 認証
$secret = $_SERVER['HTTP_X_API_SECRET'] ?? '';
if ($secret !== API_SECRET) {
    json_response(['error' => 'Unauthorized'], 401);
}

$pdo = get_db();

// スクレイピングデータまたはAI要約がある番号のみ返す
$stmt = $pdo->query("
    SELECT DISTINCT p.phone_number, p.updated_at
    FROM sagiden_phone_numbers p
    WHERE EXISTS (
        SELECT 1 FROM sagiden_comments c
        WHERE c.phone_number_id = p.id AND c.source = 'scraped'
    ) OR EXISTS (
        SELECT 1 FROM sagiden_ai_summaries s
        WHERE s.phone_number_id = p.id
    )
    ORDER BY p.updated_at DESC
");

$numbers = $stmt->fetchAll(PDO::FETCH_ASSOC);

json_response([
    'count' => count($numbers),
    'numbers' => array_map(fn($r) => [
        'number' => $r['phone_number'],
        'updated_at' => $r['updated_at'],
    ], $numbers),
]);
