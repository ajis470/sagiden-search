import tweepy

# OAuth 2.0 クライアントID/シークレットを入力
CLIENT_ID = "ZElnaC1kMkVsZ1dyNUZwcWlxZUs6MTpjaQ"
CLIENT_SECRET = "4mmoGhckd1iTGPO2DwQuGYxr9KN16-oOARl2e2BwNwYZ-1pIo6"

oauth2_handler = tweepy.OAuth2UserHandler(
    client_id=CLIENT_ID,
    redirect_uri="https://www.sagiden-search.com",
    scope=["tweet.read", "tweet.write", "users.read", "offline.access"],
    client_secret=CLIENT_SECRET
)

print("以下のURLをブラウザで開いてください（@sagiden_search でログインした状態で）:")
print(oauth2_handler.get_authorization_url())
print()
print("リダイレクト後のURL（sagiden-search.com/... のURL全体）をコピーして貼り付けてください:")
redirect_url = input("> ")

access_token = oauth2_handler.fetch_token(redirect_url)

print()
print("=== 以下をメモ帳に保存してください ===")
print(f"ACCESS_TOKEN={access_token['access_token']}")
if "refresh_token" in access_token:
    print(f"REFRESH_TOKEN={access_token['refresh_token']}")
