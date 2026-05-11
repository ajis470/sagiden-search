<?php
require_once __DIR__ . '/db.php';
if (($_GET['secret'] ?? '') !== API_SECRET) { http_response_code(401); exit; }
$pdo = get_db();
$pdo->exec("ALTER TABLE sagiden_ai_summaries MODIFY COLUMN highlights LONGTEXT NULL");
echo "OK";
