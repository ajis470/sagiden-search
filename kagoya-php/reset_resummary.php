<?php
require_once __DIR__ . '/db.php';
if (($_GET['secret'] ?? '') !== API_SECRET) { http_response_code(401); exit; }
$pdo = get_db();
$pdo->exec("UPDATE sagiden_phone_numbers SET needs_resummary = 1 WHERE comment_count > 0 AND resummary_locked = 0");
echo "OK";
