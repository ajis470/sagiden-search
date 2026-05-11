<?php
/**
 * 要約待ち番号取得エンドポイント
 * GET /api_pending.php?secret=xxx&limit=20
 *
 * needs_resummary=1 の番号と直近50件のコメントを返す
 */
require_once __DIR__ . '/db.php';

if (($_GET['secret'] ?? '') !== API_SECRET) {
    json_response(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

$limit = min((int)($_GET['limit'] ?? 20), 50);
$pdo = get_db();

$stmt = $pdo->prepare(
    'SELECT id, phone_number, danger_rank FROM sagiden_phone_numbers
     WHERE needs_resummary = 1 LIMIT ?'
);
$stmt->bindValue(1, $limit, PDO::PARAM_INT);
$stmt->execute();
$numbers = $stmt->fetchAll(PDO::FETCH_ASSOC);

$result = [];
foreach ($numbers as $row) {
    // 直近50件のpublishedコメントを取得
    $cstmt = $pdo->prepare(
        'SELECT body FROM sagiden_comments
         WHERE phone_number_id = ? AND status = "published"
         ORDER BY created_at DESC LIMIT 50'
    );
    $cstmt->execute([$row['id']]);
    $comments = $cstmt->fetchAll(PDO::FETCH_COLUMN);

    $result[] = [
        'id'           => (int)$row['id'],
        'phone_number' => $row['phone_number'],
        'comments'     => $comments,
    ];
}

json_response(['status' => 'success', 'data' => $result]);
