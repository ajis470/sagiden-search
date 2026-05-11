@echo off
cd /d C:\dev\sagiden-search\scraper
node scrape_jpnumber.js >> C:\dev\sagiden-search\scraper\scraper.log 2>&1
node summarize.js >> C:\dev\sagiden-search\scraper\scraper.log 2>&1
python notify_tweet.py >> C:\dev\sagiden-search\scraper\scraper.log 2>&1
