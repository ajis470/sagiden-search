<?php
require_once __DIR__ . '/db.php';

$secret = $_SERVER['HTTP_X_API_SECRET'] ?? ($_GET['secret'] ?? '');
if ($secret !== API_SECRET) {
    json_response(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    json_response(['status' => 'error', 'message' => 'id が不正です'], 400);
}

$pdo = get_db();

$stmt = $pdo->prepare('SELECT phone_number_id, status FROM sagiden_comments WHERE id = ?');
$stmt->execute([$id]);
$comment = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$comment) {
    json_response(['status' => 'error', 'message' => 'コメントが見つかりません'], 404);
}

$pdo->prepare('DELETE FROM sagiden_comments WHERE id = ?')->execute([$id]);

if ($comment['status'] === 'published') {
    $pdo->prepare('UPDATE sagiden_phone_numbers SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = ?')
        ->execute([$comment['phone_number_id']]);
}

json_response(['status' => 'success', 'deleted_id' => $id]);
