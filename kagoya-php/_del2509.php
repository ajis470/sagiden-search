<?php
require_once __DIR__ . '/db.php';
if (($_GET['secret'] ?? '') !== API_SECRET) { http_response_code(403); exit; }
$pdo = get_db();
$pdo->prepare('DELETE FROM sagiden_comments WHERE id = 2509')->execute();
$pdo->prepare('UPDATE sagiden_phone_numbers SET comment_count = GREATEST(comment_count - 1, 0) WHERE phone_number = "05031335964"')->execute();
json_response(['status' => 'success']);
