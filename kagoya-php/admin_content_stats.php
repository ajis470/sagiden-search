<?php
/**
 * コンテンツ品質の集計（管理者用・読み取り専用）
 * GET admin_content_stats.php?secret=X
 */
require_once __DIR__ . '/db.php';
if (($_GET['secret'] ?? '') !== API_SECRET) { http_response_code(403); exit; }

$pdo = get_db();

$total = (int)$pdo->query("SELECT COUNT(*) FROM sagiden_phone_numbers")->fetchColumn();
$has_rank = (int)$pdo->query("SELECT COUNT(*) FROM sagiden_phone_numbers WHERE danger_rank IS NOT NULL")->fetchColumn();
$no_rank = $total - $has_rank;

$has_user_comment = (int)$pdo->query(
    "SELECT COUNT(DISTINCT phone_number_id) FROM sagiden_comments WHERE source = 'user' AND status = 'published'"
)->fetchColumn();

$has_any_comment = (int)$pdo->query(
    "SELECT COUNT(DISTINCT phone_number_id) FROM sagiden_comments"
)->fetchColumn();

$no_comment_at_all = $total - $has_any_comment;

$rank_breakdown = $pdo->query(
    "SELECT danger_rank, COUNT(*) c FROM sagiden_phone_numbers GROUP BY danger_rank ORDER BY c DESC"
)->fetchAll(PDO::FETCH_ASSOC);

json_response([
    'status' => 'success',
    'total_numbers' => $total,
    'has_ai_summary' => $has_rank,
    'no_ai_summary_judging_page' => $no_rank,
    'has_any_comment_scraped_or_user' => $has_any_comment,
    'has_zero_comment' => $no_comment_at_all,
    'has_published_user_comment' => $has_user_comment,
    'rank_breakdown' => $rank_breakdown,
]);
