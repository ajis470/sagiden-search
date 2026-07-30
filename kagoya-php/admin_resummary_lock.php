<?php
/**
 * AI再要約ロック管理（管理者用）
 *
 * GET admin_resummary_lock.php?secret=X
 *   → ロック中の番号を一覧表示
 * GET admin_resummary_lock.php?secret=X&number=Y&action=lock&reason=Z
 *   → 指定番号をロック（以後 needs_resummary は立たなくなる）
 * GET admin_resummary_lock.php?secret=X&number=Y&action=unlock
 *   → ロック解除
 */
require_once __DIR__ . '/db.php';

if (($_GET['secret'] ?? '') !== API_SECRET) { http_response_code(403); exit; }

$pdo    = get_db();
$number = isset($_GET['number']) ? normalize_phone($_GET['number']) : '';
$action = $_GET['action'] ?? '';

if ($number === '') {
    // 一覧表示
    $stmt = $pdo->query(
        "SELECT phone_number, danger_rank, lock_reason, locked_at
         FROM sagiden_phone_numbers
         WHERE resummary_locked = 1
         ORDER BY locked_at DESC"
    );
    json_response(['status' => 'success', 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

$stmt = $pdo->prepare('SELECT id FROM sagiden_phone_numbers WHERE phone_number = ?');
$stmt->execute([$number]);
$phone_id = $stmt->fetchColumn();
if (!$phone_id) {
    json_response(['status' => 'error', 'message' => '番号が見つかりません'], 404);
}

if ($action === 'lock') {
    $reason = trim($_GET['reason'] ?? '');
    $pdo->prepare(
        'UPDATE sagiden_phone_numbers SET resummary_locked = 1, lock_reason = ?, locked_at = NOW(), needs_resummary = 0 WHERE id = ?'
    )->execute([$reason ?: null, $phone_id]);
    json_response(['status' => 'success', 'action' => 'locked']);
} elseif ($action === 'unlock') {
    $pdo->prepare(
        'UPDATE sagiden_phone_numbers SET resummary_locked = 0, lock_reason = NULL, locked_at = NULL WHERE id = ?'
    )->execute([$phone_id]);
    json_response(['status' => 'success', 'action' => 'unlocked']);
} else {
    json_response(['status' => 'error', 'message' => 'action は lock か unlock を指定してください'], 400);
}
