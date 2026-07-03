<?php
/**
 * トップページ用リスト取得エンドポイント
 * GET /api_lists.php
 *
 * - new_arrivals:     新たに情報が集まった番号20件（番号の登録日時が新しい順）
 * - recent_comments:  最近口コミが書かれた番号20件（ユーザー投稿・公開済みの最新口コミ順）
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

$stmt = $pdo->query('
    SELECT pn.phone_number, MAX(c.created_at) AS last_comment_at
    FROM sagiden_comments c
    JOIN sagiden_phone_numbers pn ON pn.id = c.phone_number_id
    WHERE c.source = "user" AND c.status = "published"
    GROUP BY c.phone_number_id
    ORDER BY last_comment_at DESC
    LIMIT 20
');
$recent_comments = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'phone_number');

json_response([
    'status'          => 'success',
    'new_arrivals'    => $new_arrivals,
    'recent_comments' => $recent_comments,
]);
