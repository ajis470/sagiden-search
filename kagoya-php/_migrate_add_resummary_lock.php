<?php
require_once __DIR__ . '/db.php';
if (($_GET['secret'] ?? '') !== API_SECRET) { http_response_code(403); exit; }
$pdo = get_db();
// MySQL 5.7 doesn't support IF NOT EXISTS in ALTER TABLE
$stmt = $pdo->query("SHOW COLUMNS FROM sagiden_phone_numbers LIKE 'resummary_locked'");
if ($stmt->rowCount() === 0) {
    $pdo->exec("ALTER TABLE sagiden_phone_numbers
        ADD COLUMN resummary_locked TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=AI再要約を永久停止（人手で確定した内容を保持）',
        ADD COLUMN lock_reason VARCHAR(255) NULL COMMENT 'ロック理由のメモ',
        ADD COLUMN locked_at DATETIME NULL");
}
json_response(['status' => 'done']);
