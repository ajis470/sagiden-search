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
    FROM sagiden_phone_numbers pn
    JOIN sagiden_ai_summaries s ON s.phone_number_id = pn.id
    ORDER BY pn.created_at DESC
    LIMIT 20
');
$new_arrivals = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'phone_number');

json_response([
    'status'       => 'success',
    'new_arrivals' => $new_arrivals,
]);
