-- みんなの迷惑電話番号データベース
-- 既存DB（ajis470kagoya）に追加。テーブル名は sagiden_ プレフィックス。

-- 電話番号マスタ
CREATE TABLE sagiden_phone_numbers (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone_number   VARCHAR(15) NOT NULL UNIQUE COMMENT '正規化済み（例: 0312345678）',
    danger_rank    ENUM('C','B','A','S','SS','SSS') NULL COMMENT 'NULL=未判定（判定中表示）',
    comment_count  INT UNSIGNED NOT NULL DEFAULT 0,
    search_count_24h INT UNSIGNED NOT NULL DEFAULT 0,
    last_searched_at DATETIME NULL,
    needs_resummary  TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'AI要約の再生成フラグ',
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_danger_rank (danger_rank),
    INDEX idx_search_count (search_count_24h DESC),
    INDEX idx_last_searched (last_searched_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- コメント（ユーザー投稿＋スクレーピング）
CREATE TABLE sagiden_comments (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone_number_id  INT UNSIGNED NOT NULL,
    body             TEXT NOT NULL,
    body_hash        CHAR(32) NOT NULL COMMENT '重複チェック用MD5',
    status           ENUM('published','pending') NOT NULL DEFAULT 'pending',
    source           ENUM('user','scraped') NOT NULL,
    source_site      VARCHAR(100) NULL COMMENT 'スクレーピング元サイト名',
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone_number (phone_number_id),
    INDEX idx_status (status),
    UNIQUE KEY uq_body_hash (phone_number_id, body_hash),
    FOREIGN KEY (phone_number_id) REFERENCES sagiden_phone_numbers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI生成要約（1番号1レコード、再生成でUPDATE）
CREATE TABLE sagiden_ai_summaries (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone_number_id  INT UNSIGNED NOT NULL UNIQUE,
    summary          TEXT NOT NULL COMMENT '結局何者か・手口の3行要約',
    recommended_action TEXT NOT NULL COMMENT '推奨アクション・撃退フレーズ等',
    danger_rank      ENUM('C','B','A','S','SS','SSS') NOT NULL,
    generated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_number_id) REFERENCES sagiden_phone_numbers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 検索ログ（炎上中判定用）
CREATE TABLE sagiden_search_logs (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone_number_id  INT UNSIGNED NOT NULL,
    searched_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone_searched (phone_number_id, searched_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
