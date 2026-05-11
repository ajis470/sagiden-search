import requests
import json
import os

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "twitter_tokens.json")
API_BASE = "https://api.sagiden-search.com"
SITE_BASE = "https://sagiden-search.com/tel"


def load_config():
    with open(CONFIG_FILE, encoding="utf-8") as f:
        return json.load(f)


def save_config(config):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)


def refresh_access_token(config):
    response = requests.post(
        "https://api.twitter.com/2/oauth2/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": config["refresh_token"],
            "client_id": config["client_id"],
        },
        auth=(config["client_id"], config["client_secret"])
    )
    data = response.json()
    if "access_token" not in data:
        raise Exception(f"トークンリフレッシュ失敗: {data}")
    config["access_token"] = data["access_token"]
    if "refresh_token" in data:
        config["refresh_token"] = data["refresh_token"]
    save_config(config)
    return config


def post_tweet(access_token, text, reply_to=None):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    payload = {"text": text}
    if reply_to:
        payload["reply"] = {"in_reply_to_tweet_id": reply_to}
    response = requests.post(
        "https://api.twitter.com/2/tweets",
        headers=headers,
        json=payload,
        timeout=10
    )
    data = response.json()
    if "data" not in data:
        raise Exception(f"ツイート投稿失敗: {data}")
    return data["data"]["id"]


def get_trending():
    response = requests.get(
        f"{API_BASE}/api_trending.php",
        params={"period": "7d", "limit": 10},
        timeout=10
    )
    data = response.json()
    return data.get("trending", [])


def format_tweet(items, label):
    lines = [f"📞 今週の急上昇迷惑電話（{label}）\n"]
    for i, item in enumerate(items, start=1):
        num = item["phone_number"]
        rank = item.get("danger_rank") or ""
        badge = f" [{rank}]" if rank else ""
        lines.append(f"{i}位 {num}{badge}")
        lines.append(f"{SITE_BASE}/{num}")
    lines.append("\n#迷惑電話 #詐欺電話")
    return "\n".join(lines)


def main():
    config = load_config()
    config = refresh_access_token(config)

    trending = get_trending()
    if not trending:
        print("トレンドデータなし。スキップします。")
        return

    # ツイート1: 1〜5位
    tweet1_text = format_tweet(trending[:5], "1〜5位")
    tweet1_id = post_tweet(config["access_token"], tweet1_text)
    print(f"ツイート1投稿完了: {tweet1_id}")

    # ツイート2: 6〜10位（6件以上ある場合のみスレッドで続ける）
    if len(trending) >= 6:
        tweet2_text = format_tweet(trending[5:10], "6〜10位")
        resp2_id = post_tweet(config["access_token"], tweet2_text, reply_to=tweet1_id)
        print(f"ツイート2投稿完了: {resp2_id}")

    print("完了")


if __name__ == "__main__":
    main()
