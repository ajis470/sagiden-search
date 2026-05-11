<?php
require_once __DIR__ . '/db.php';
if (($_GET['secret'] ?? '') !== API_SECRET) { http_response_code(403); exit; }
$pdo = get_db();
$pdo->prepare('UPDATE sagiden_comments SET status = "published" WHERE id = 2515')->execute();
$pdo->prepare('UPDATE sagiden_phone_numbers SET comment_count = comment_count + 1, needs_resummary = 1 WHERE phone_number = "08007003374"')->execute();
json_response(['status' => 'done']);
