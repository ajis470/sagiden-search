<?php
require_once __DIR__ . '/db.php';
$secret = $_GET['secret'] ?? '';
if ($secret !== API_SECRET) { http_response_code(401); die('Unauthorized'); }
$id = (int)($_GET['id'] ?? 0);
if (!$id) { die('id required'); }
$pdo = get_db();

// コメントが存在し、かつpendingであることを確認
$stmt = $pdo->prepare('SELECT phone_number_id, status FROM sagiden_comments WHERE id = ?');
$stmt->execute([$id]);
$comment = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$comment) { http_response_code(404); die(json_encode(['status' => 'error', 'message' => 'comment not found'])); }

$pdo->prepare('UPDATE sagiden_comments SET status = "published" WHERE id = ?')->execute([$id]);

// pendingだった場合のみ: comment_countをインクリメント＆再要約フラグをセット
// （すでにpublishedだったものを再承認する場合は二重カウントしない）
if ($comment['status'] === 'pending') {
    $pdo->prepare('UPDATE sagiden_phone_numbers SET comment_count = comment_count + 1, needs_resummary = 1 WHERE id = ?')
        ->execute([$comment['phone_number_id']]);
}

echo json_encode(['status' => 'success', 'updated_id' => $id]);
