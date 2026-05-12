@echo off
cd /d C:\dev\sagiden-search\scraper
for /f "tokens=1,2 delims==" %%a in (.env.local) do set %%a=%%b
node daily_scrape.js >> C:\dev\sagiden-search\scraper\scraper_daily.log 2>&1
