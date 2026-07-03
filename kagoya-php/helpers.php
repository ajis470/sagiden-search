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
    // Search Consoleでオーナー登録されているのは非wwwプロパティ。
    // Indexing API/IndexNowの所有権照合が通るよう非wwwで送る（Googleは307で正規wwwを辿る）。
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

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * サービスアカウントJWTでGoogle OAuth2アクセストークンを取得
 * （scope: indexing）。失敗時はnull。
 */
function google_access_token() {
    if (!defined('GOOGLE_INDEXING_CLIENT_EMAIL') || !defined('GOOGLE_INDEXING_PRIVATE_KEY')) return null;
    if (GOOGLE_INDEXING_CLIENT_EMAIL === '' || GOOGLE_INDEXING_PRIVATE_KEY === '') return null;

    $now    = time();
    $header = base64url_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $claim  = base64url_encode(json_encode([
        'iss'   => GOOGLE_INDEXING_CLIENT_EMAIL,
        'scope' => 'https://www.googleapis.com/auth/indexing',
        'aud'   => 'https://oauth2.googleapis.com/token',
        'iat'   => $now,
        'exp'   => $now + 3600,
    ]));
    $signing_input = $header . '.' . $claim;
    $signature = '';
    if (!openssl_sign($signing_input, $signature, GOOGLE_INDEXING_PRIVATE_KEY, OPENSSL_ALGO_SHA256)) {
        return null;
    }
    $jwt = $signing_input . '.' . base64url_encode($signature);

    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $jwt,
        ]),
        CURLOPT_TIMEOUT        => 5,
        CURLOPT_CONNECTTIMEOUT => 3,
    ]);
    $res = curl_exec($ch);
    curl_close($ch);
    if (!$res) return null;
    $data = json_decode($res, true);
    return isset($data['access_token']) ? $data['access_token'] : null;
}

/**
 * Google Indexing APIへ URL_UPDATED を送信（フロントの番号ページURL）。
 * 失敗しても要約保存の応答を遅らせない。$return_body=trueで応答本文を返す（テスト用）。
 */
function google_indexing_ping(string $front_url, bool $return_body = false) {
    $token = google_access_token();
    if (!$token) return $return_body ? ['http_code' => 0, 'body' => 'no_token'] : null;
    $ch = curl_init('https://indexing.googleapis.com/v3/urlNotifications:publish');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
        ],
        CURLOPT_POSTFIELDS     => json_encode(['url' => $front_url, 'type' => 'URL_UPDATED']),
        CURLOPT_TIMEOUT        => 6,
        CURLOPT_CONNECTTIMEOUT => 3,
    ]);
    $res  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($return_body) return ['http_code' => $code, 'body' => $res];
    return null;
}

function json_response(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: https://sagiden-search.com');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
