<?php

function normalize_phone(string $raw): string {
    $trimmed = trim($raw);
    if (strpos($trimmed, '+') === 0) {
        $digits = preg_replace('/[^0-9]/', '', mb_convert_kana(substr($trimmed, 1), 'n'));
        return '+' . $digits;
    }
    $num = preg_replace('/[^0-9]/', '', mb_convert_kana($trimmed, 'n'));
    // 0始まりでない=国際番号として+を付ける
    if ($num !== '' && $num[0] !== '0') {
        return '+' . $num;
    }
    return $num;
}

function json_response(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: https://sagiden-search.com');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
