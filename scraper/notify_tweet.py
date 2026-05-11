import requests
import smtplib
from email.mime.text import MIMEText

API_BASE = "https://api.sagiden-search.com"
GMAIL_USER = "ajis470@gmail.com"
GMAIL_APP_PASSWORD = "barl lnvs wgne pddp"
TO_EMAIL = "ajis470@gmail.com"


def get_trending():
    r = requests.get(f"{API_BASE}/api_trending.php", params={"period": "7d", "limit": 10}, timeout=10)
    return r.json().get("trending", [])


def format_tweet(items, label, start):
    lines = [f"📞 今週の急上昇迷惑電話{label}\n"]
    for i, item in enumerate(items, start=start):
        num = item["phone_number"]
        rank = item.get("danger_rank") or ""
        badge = f" 危{rank}" if rank else ""
        lines.append(f"{i}位 {num}{badge}")
        lines.append(f"https://sagiden-search.com/tel/{num}")
    lines.append("\n#迷惑電話 #詐欺電話")
    return "\n".join(lines)


def send_email(tweet1, tweet2):
    body = f"【ツイート1】コピペしてポストしてください\n\n{tweet1}"
    if tweet2:
        body += f"\n\n{'='*30}\n\n【ツイート2】リプライでスレッド投稿してください\n\n{tweet2}"

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = "【sagiden】今週のポスト内容"
    msg["From"] = GMAIL_USER
    msg["To"] = TO_EMAIL

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        smtp.send_message(msg)
    print("メール送信完了")


def main():
    trending = get_trending()
    if not trending:
        print("トレンドデータなし。メール送信スキップ。")
        return

    tweet1 = format_tweet(trending[:5], "1/2", 1)
    tweet2 = format_tweet(trending[5:10], "2/2", 6) if len(trending) >= 6 else None

    send_email(tweet1, tweet2)


if __name__ == "__main__":
    main()
