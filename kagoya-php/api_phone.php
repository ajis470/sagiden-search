<?php
/**
 * 番号検索エンドポイント
 * GET /api_phone.php?number=0312345678
 *
 * - 存在する番号 → データを返す
 * - 未知の番号   → sagiden_phone_numbersにINSERT後、データを返す
 * - 両方とも sagiden_search_logs に記録し、search_count_24h を更新する
 */
require_once __DIR__ . '/db.php';

$raw = $_GET['number'] ?? '';
$number = normalize_phone($raw);

if (strpos($number, '+') === 0) {
    $digits = substr($number, 1);
    if (strlen($digits) < 7 || strlen($digits) > 15) {
        json_response(['status' => 'error', 'message' => '番号が不正です'], 400);
    }
} else {
    if (strlen($number) < 10 || strlen($number) > 11) {
        json_response(['status' => 'error', 'message' => '番号が不正です'], 400);
    }
}

$pdo = get_db();

// 番号を取得（なければINSERT）
$stmt = $pdo->prepare('SELECT * FROM sagiden_phone_numbers WHERE phone_number = ?');
$stmt->execute([$number]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    $pdo->prepare('INSERT INTO sagiden_phone_numbers (phone_number) VALUES (?)')->execute([$number]);
    $id = (int)$pdo->lastInsertId();
    $row = [
        'id'               => $id,
        'phone_number'     => $number,
        'danger_rank'      => null,
        'comment_count'    => 0,
        'search_count_24h' => 0,
        'last_searched_at' => null,
        'created_at'       => date('Y-m-d H:i:s'),
    ];
}

$phone_id = (int)$row['id'];

// 検索ログ記録
$pdo->prepare('INSERT INTO sagiden_search_logs (phone_number_id) VALUES (?)')->execute([$phone_id]);

// search_count_24h を直近24時間の実数で更新
$stmt = $pdo->prepare('SELECT COUNT(*) FROM sagiden_search_logs WHERE phone_number_id = ? AND searched_at >= NOW() - INTERVAL 24 HOUR');
$stmt->execute([$phone_id]);
$count_24h = (int)$stmt->fetchColumn();

$pdo->prepare('UPDATE sagiden_phone_numbers SET search_count_24h = ?, last_searched_at = NOW() WHERE id = ?')
    ->execute([$count_24h, $phone_id]);

// コメント（ユーザー投稿のみ。published + pending を返す。スクレーピング分は要約生成の材料としてのみ使用）
$stmt = $pdo->prepare('SELECT id, body, source, status, call_type, created_at FROM sagiden_comments WHERE phone_number_id = ? AND source = "user" AND status IN ("published", "pending") ORDER BY created_at DESC');
$stmt->execute([$phone_id]);
$sagiden_comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

// AI要約
$stmt = $pdo->prepare('SELECT summary, recommended_action, danger_rank, highlights, generated_at FROM sagiden_ai_summaries WHERE phone_number_id = ?');
$stmt->execute([$phone_id]);
$summary = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
if ($summary) {
    $summary['highlights'] = json_decode($summary['highlights'] ?? '[]', true) ?? [];
}

json_response([
    'status' => 'success',
    'data'   => [
        'id'               => $phone_id,
        'phone_number'     => $row['phone_number'],
        'danger_rank'      => $row['danger_rank'],
        'comment_count'    => (int)$row['comment_count'],
        'search_count_24h' => $count_24h,
        'comments'         => $sagiden_comments,
        'ai_summary'       => $summary,
    ],
]);
