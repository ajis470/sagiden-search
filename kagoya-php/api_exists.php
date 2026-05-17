<?php
/**
 * 番号存在確認エンドポイント（サイドエフェクトなし）
 * GET /api_exists.php?secret=...&number=08003007022
 * Returns: { "exists": true/false }
 */
require_once __DIR__ . '/db.php';

if (($_GET['secret'] ?? '') !== API_SECRET) {
    json_response(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

$number = normalize_phone($_GET['number'] ?? '');
if (strlen($number) < 10 || strlen($number) > 11) {
    json_response(['status' => 'error', 'message' => '番号が不正です'], 400);
}

$pdo = get_db();
$stmt = $pdo->prepare('SELECT COUNT(*) FROM sagiden_phone_numbers WHERE phone_number = ?');
$stmt->execute([$number]);
$exists = (int)$stmt->fetchColumn() > 0;

json_response(['exists' => $exists]);
