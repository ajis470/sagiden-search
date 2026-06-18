<?php
/**
 * AI要約保存エンドポイント
 * POST /api_summary.php
 * Body: { secret, phone_number_id, summary, recommended_action, danger_rank, highlights }
 */
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['status' => 'error', 'message' => 'POST only'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (($input['secret'] ?? '') !== API_SECRET) {
    json_response(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

$phone_number_id    = (int)($input['phone_number_id'] ?? 0);
$summary            = trim($input['summary'] ?? '');
$recommended_action = trim($input['recommended_action'] ?? '');
$danger_rank        = $input['danger_rank'] ?? 'C';
$highlights         = isset($input['highlights']) ? json_encode($input['highlights'], JSON_UNESCAPED_UNICODE) : null;

if (!$phone_number_id || !$summary || !$recommended_action) {
    json_response(['status' => 'error', 'message' => 'パラメータ不足'], 400);
}

$valid_ranks = ['C', 'B', 'A', 'S', 'SS', 'SSS'];
if (!in_array($danger_rank, $valid_ranks, true)) {
    $danger_rank = 'C';
}

$pdo = get_db();

// ai_summaries を INSERT or UPDATE
$pdo->prepare(
    'INSERT INTO sagiden_ai_summaries (phone_number_id, summary, recommended_action, danger_rank, highlights)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       summary = VALUES(summary),
       recommended_action = VALUES(recommended_action),
       danger_rank = VALUES(danger_rank),
       highlights = VALUES(highlights),
       generated_at = NOW()'
)->execute([$phone_number_id, $summary, $recommended_action, $danger_rank, $highlights]);

// phone_numbers の danger_rank と needs_resummary を更新
$pdo->prepare(
    'UPDATE sagiden_phone_numbers SET danger_rank = ?, needs_resummary = 0 WHERE id = ?'
)->execute([$danger_rank, $phone_number_id]);

// IndexNow へインデックス送信（フロントの番号ページURL）
$stmt = $pdo->prepare('SELECT phone_number FROM sagiden_phone_numbers WHERE id = ?');
$stmt->execute([$phone_number_id]);
$num = $stmt->fetchColumn();
if ($num) {
    indexnow_ping(tel_url($num));
}

json_response(['status' => 'success']);
