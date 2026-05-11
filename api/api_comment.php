<?php
/**
 * コメント投稿エンドポイント
 * POST /api_comment.php
 * Body: phone_number, body, secret
 *
 * - Geminiによる審査はNext.js側で行い、結果(status)をこのAPIに送る
 * - statusが"published"のときだけcomment_countをインクリメント
 */
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['status' => 'error', 'message' => 'POST only'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$secret  = $_SERVER['HTTP_X_API_SECRET'] ?? ($input['secret'] ?? '');
$raw     = $input['phone_number'] ?? '';
$body    = trim($input['body']    ?? '');
$status  = $input['status']       ?? 'pending'; // published or pending

if ($secret !== API_SECRET) {
    json_response(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

$number = normalize_phone($raw);
if (strlen($number) < 10 || strlen($number) > 11) {
    json_response(['status' => 'error', 'message' => '番号が不正です'], 400);
}
if (mb_strlen($body) < 5 || mb_strlen($body) > 1000) {
    json_response(['status' => 'error', 'message' => '本文は5〜1000文字で入力してください'], 400);
}
if (!in_array($status, ['published', 'pending'], true)) {
    $status = 'pending';
}

$pdo = get_db();

// 番号が存在しない場合はINSERT
$stmt = $pdo->prepare('SELECT id FROM sagiden_phone_numbers WHERE phone_number = ?');
$stmt->execute([$number]);
$phone_id = $stmt->fetchColumn();

if (!$phone_id) {
    $pdo->prepare('INSERT INTO sagiden_phone_numbers (phone_number) VALUES (?)')->execute([$number]);
    $phone_id = (int)$pdo->lastInsertId();
}

// コメントINSERT（重複は無視）
$body_hash = md5($body);
try {
    $pdo->prepare('INSERT INTO sagiden_comments (phone_number_id, body, body_hash, status, source) VALUES (?, ?, ?, ?, "user")')
        ->execute([$phone_id, $body, $body_hash, $status]);
} catch (\PDOException $e) {
    if ($e->errorInfo[1] === 1062) { // Duplicate entry
        json_response(['status' => 'success']);
    }
    throw $e;
}

// publishedのときだけcomment_countをインクリメント
if ($status === 'published') {
    $pdo->prepare('UPDATE sagiden_phone_numbers SET comment_count = comment_count + 1 WHERE id = ?')
        ->execute([$phone_id]);
}

json_response(['status' => 'success']);
