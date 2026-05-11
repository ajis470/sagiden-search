import pymysql

conn = pymysql.connect(
    host='mysql57s-22.kagoya.net',
    user='ajis470kagoya',
    password='kagoya1650',
    database='ajis470kagoya_sagiden',
    charset='utf8mb4'
)
cur = conn.cursor()
cur.execute("""
    SELECT c.id, c.body, c.status, c.created_at
    FROM sagiden_comments c
    JOIN sagiden_phone_numbers p ON p.id = c.phone_number_id
    WHERE p.phone_number = '05031233138'
    ORDER BY c.created_at DESC
    LIMIT 5
""")
for row in cur.fetchall():
    print(row)
conn.close()
