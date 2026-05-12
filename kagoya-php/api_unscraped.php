<?php
/**
 * スクレイプ未完了番号取得エンドポイント
 * GET /api_unscraped.php?secret=xxx&limit=50
 *
 * scraped ソースのコメントが1件もない番号を返す（新着順）
 */
require_once __DIR__ . '/db.php';

if (($_GET['secret'] ?? '') !== API_SECRET) {
    json_response(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

$limit = min((int)($_GET['limit'] ?? 50), 200);
$pdo = get_db();

$stmt = $pdo->prepare(
    'SELECT phone_number FROM sagiden_phone_numbers pn
     WHERE NOT EXISTS (
         SELECT 1 FROM sagiden_comments c
         WHERE c.phone_number_id = pn.id AND c.source = "scraped"
     )
     ORDER BY pn.created_at DESC
     LIMIT ?'
);
$stmt->bindValue(1, $limit, PDO::PARAM_INT);
$stmt->execute();
$numbers = $stmt->fetchAll(PDO::FETCH_COLUMN);

json_response(['status' => 'success', 'data' => $numbers]);
