<?php
require_once __DIR__ . '/db.php';
if (($_GET['secret'] ?? '') !== API_SECRET) { http_response_code(403); exit; }
$pdo = get_db();
$pdo->exec('ALTER TABLE sagiden_comments ADD COLUMN IF NOT EXISTS call_type VARCHAR(20) NULL');
json_response(['status' => 'done']);
