<?php
/**
 * 炎上中番号一覧エンドポイント（トップページ用）
 * GET /api_trending.php?limit=10
 *
 * 直近24時間の検索数が多い順に返す
 */
require_once __DIR__ . '/db.php';

$limit = min((int)($_GET['limit'] ?? 10), 50);

$pdo = get_db();

$stmt = $pdo->prepare(
    'SELECT p.phone_number, p.danger_rank, p.comment_count, p.search_count_24h,
            s.summary, s.danger_rank AS ai_rank
     FROM sagiden_phone_numbers p
     LEFT JOIN sagiden_ai_summaries s ON s.phone_number_id = p.id
     WHERE p.search_count_24h > 0
     ORDER BY p.search_count_24h DESC
     LIMIT ?'
);
$stmt->execute([$limit]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

json_response(['status' => 'success', 'data' => $rows]);
