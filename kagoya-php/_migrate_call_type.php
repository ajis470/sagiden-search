<?php
require_once __DIR__ . '/db.php';
if (($_GET['secret'] ?? '') !== API_SECRET) { http_response_code(403); exit; }
$pdo = get_db();
// MySQL 5.7 doesn't support IF NOT EXISTS in ALTER TABLE
$stmt = $pdo->query("SHOW COLUMNS FROM sagiden_comments LIKE 'call_type'");
if ($stmt->rowCount() === 0) {
    $pdo->exec('ALTER TABLE sagiden_comments ADD COLUMN call_type VARCHAR(20) NULL');
}
json_response(['status' => 'done']);
