<?php
/**
 * スクレーピングデータ受け取りエンドポイント
 * POST /api_scrape.php
 * Body: { secret, phone_number, comments: string[], source_site }
 *
 * - 新規コメントのみINSERT（本文ハッシュで重複チェック）
 * - 新コメントがあればneeds_resummary=1にセット
 */
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['status' => 'error', 'message' => 'POST only'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (($input['secret'] ?? '') !== API_SECRET) {
    json_response(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

$number      = normalize_phone($input['phone_number'] ?? '');
$comments    = $input['comments'] ?? [];
$source_site = $input['source_site'] ?? '';

if (strlen($number) < 10 || strlen($number) > 11) {
    json_response(['status' => 'error', 'message' => '番号が不正です'], 400);
}
if (!is_array($comments)) {
    json_response(['status' => 'error', 'message' => 'コメントなし'], 400);
}
// force_resummary=true の場合は空コメントでもフラグセットのみ許可
if (count($comments) === 0 && empty($input['force_resummary'])) {
    json_response(['status' => 'error', 'message' => 'コメントなし'], 400);
}

$pdo = get_db();

// 番号が存在しなければINSERT
$stmt = $pdo->prepare('SELECT id FROM sagiden_phone_numbers WHERE phone_number = ?');
$stmt->execute([$number]);
$phone_id = $stmt->fetchColumn();

if (!$phone_id) {
    $pdo->prepare('INSERT INTO sagiden_phone_numbers (phone_number) VALUES (?)')->execute([$number]);
    $phone_id = (int)$pdo->lastInsertId();
}

// 既存コメントのハッシュ一覧を取得（重複チェック用）
$stmt = $pdo->prepare('SELECT body_hash FROM sagiden_comments WHERE phone_number_id = ?');
$stmt->execute([$phone_id]);
$existing_hashes = array_flip($stmt->fetchAll(PDO::FETCH_COLUMN));

// 新規コメントだけINSERT
$inserted = 0;
$insert_stmt = $pdo->prepare(
    'INSERT INTO sagiden_comments (phone_number_id, body, body_hash, status, source, source_site) VALUES (?, ?, ?, "published", "scraped", ?)'
);

foreach ($comments as $body) {
    $body = trim($body);
    if (mb_strlen($body) < 5) continue;

    $hash = md5($body);
    if (isset($existing_hashes[$hash])) continue; // 重複スキップ

    $insert_stmt->execute([$phone_id, $body, $hash, $source_site]);
    $existing_hashes[$hash] = true;
    $inserted++;
}

// reset_resummary=true の場合はneeds_resummary=0にリセットして終了（コメント0件番号の滞留解消用）
if (!empty($input['reset_resummary'])) {
    $pdo->prepare('UPDATE sagiden_phone_numbers SET needs_resummary = 0 WHERE id = ?')
        ->execute([$phone_id]);
    json_response(['status' => 'success', 'action' => 'reset_resummary']);
}

// comment_count を更新。force_resummary=true の場合は件数に関わらずフラグをセット
$force_resummary = !empty($input['force_resummary']);
if ($inserted > 0 || $force_resummary) {
    $resummary_flag = ($force_resummary || $inserted >= 5) ? 1 : 0;
    $pdo->prepare('UPDATE sagiden_phone_numbers SET needs_resummary = GREATEST(needs_resummary, ?), comment_count = comment_count + ? WHERE id = ?')
        ->execute([$resummary_flag, $inserted, $phone_id]);
}

json_response([
    'status'   => 'success',
    'inserted' => $inserted,
    'skipped'  => count($comments) - $inserted,
]);
