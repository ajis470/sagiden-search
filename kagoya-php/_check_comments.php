<?php
require_once __DIR__ . '/db.php';
if (($_GET['secret'] ?? '') !== API_SECRET) { http_response_code(403); exit; }
$pdo = get_db();
$stmt = $pdo->prepare('SELECT id, body, status, source, created_at FROM sagiden_comments WHERE phone_number_id = (SELECT id FROM sagiden_phone_numbers WHERE phone_number = ?) ORDER BY created_at DESC LIMIT 5');
$stmt->execute([$_GET['number'] ?? '']);
json_response($stmt->fetchAll(PDO::FETCH_ASSOC));
