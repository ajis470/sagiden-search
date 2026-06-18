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

function tel_url(string $number): string {
    $path = (strpos($number, '+') === 0) ? 'plus' . substr($number, 1) : $number;
    return 'https://sagiden-search.com/tel/' . $path;
}

function indexnow_ping(string $front_url): void {
    if (!defined('INDEXNOW_KEY') || INDEXNOW_KEY === '') return;
    $endpoint = 'https://api.indexnow.org/indexnow?url=' . urlencode($front_url)
              . '&key=' . urlencode(INDEXNOW_KEY);
    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 3,   // 失敗してもAPI応答を遅らせない
        CURLOPT_CONNECTTIMEOUT => 2,
    ]);
    curl_exec($ch);
    curl_close($ch);
}

function json_response(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: https://sagiden-search.com');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
