<?php
/**
 * ランキング・危険度一覧エンドポイント
 * GET /api_trending.php?period=24h|7d|30d|danger&limit=20
 */
require_once __DIR__ . '/db.php';

$period = $_GET['period'] ?? '24h';
$limit  = min((int)($_GET['limit'] ?? 20), 50);
$pdo    = get_db();

if ($period === 'danger') {
    // 危険度が高い番号（SSS/SS/S）
    $stmt = $pdo->prepare(
        'SELECT p.phone_number, p.danger_rank, p.comment_count, p.search_count_24h,
                s.summary
         FROM sagiden_phone_numbers p
         LEFT JOIN sagiden_ai_summaries s ON s.phone_number_id = p.id
         WHERE p.danger_rank IN ("SSS","SS","S")
         ORDER BY FIELD(p.danger_rank,"SSS","SS","S"), p.search_count_24h DESC
         LIMIT ?'
    );
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    json_response(['status' => 'success', 'trending' => $rows]);
}

// 期間ごとの集計
if ($period === '7d') {
    $interval = '7 DAY';
} elseif ($period === '30d') {
    $interval = '30 DAY';
} else {
    $interval = '24 HOUR';
}

$stmt = $pdo->prepare(
    'SELECT p.phone_number, p.danger_rank, p.comment_count, p.search_count_24h,
            s.summary,
            COUNT(l.id) AS period_count
     FROM sagiden_search_logs l
     JOIN sagiden_phone_numbers p ON p.id = l.phone_number_id
     LEFT JOIN sagiden_ai_summaries s ON s.phone_number_id = p.id
     WHERE l.searched_at >= NOW() - INTERVAL ' . $interval . '
     GROUP BY l.phone_number_id
     ORDER BY period_count DESC
     LIMIT ?'
);
$stmt->bindValue(1, $limit, PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

json_response(['status' => 'success', 'trending' => $rows]);
