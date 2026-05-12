<?php
/**
 * トップページ用リスト取得エンドポイント
 * GET /api_lists.php
 *
 * - recent: AI要約が最近更新された番号20件
 * - wanted: 情報募集中（comment_count <= 1）の番号20件
 */
require_once __DIR__ . '/db.php';

$pdo = get_db();

$stmt = $pdo->query('
    SELECT pn.phone_number
    FROM sagiden_ai_summaries s
    JOIN sagiden_phone_numbers pn ON pn.id = s.phone_number_id
    ORDER BY s.generated_at DESC
    LIMIT 20
');
$recent = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'phone_number');

$stmt = $pdo->query('
    SELECT phone_number
    FROM sagiden_phone_numbers
    WHERE comment_count <= 1
    ORDER BY last_searched_at DESC
    LIMIT 20
');
$wanted = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'phone_number');

json_response([
    'status' => 'success',
    'recent' => $recent,
    'wanted' => $wanted,
]);
