<?php
define('DB_HOST', 'mysql57s-22.kagoya.net');
define('DB_NAME', 'ajis470kagoya_sagiden');
define('DB_USER', 'ajis470kagoya');
define('DB_PASS', 'kagoya1650');
define('API_SECRET', 'sgd_2026_xK9mPqR4vLzN');

function get_db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }
    return $pdo;
}

function json_response(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: https://sagiden-search.com');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// 電話番号を正規化（ハイフン除去、半角化）
function normalize_phone(string $raw): string {
    $trimmed = trim($raw);
    if (strpos($trimmed, '+') === 0) {
        $digits = preg_replace('/[^0-9]/', '', mb_convert_kana(substr($trimmed, 1), 'n'));
        return '+' . $digits;
    }
    $num = mb_convert_kana($trimmed, 'n');
    return preg_replace('/[^0-9]/', '', $num);
}
