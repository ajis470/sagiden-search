@echo off
cd /d C:\dev\sagiden-search\scraper
for /f "tokens=1,2 delims==" %%a in (.env.local) do set %%a=%%b
node hourly_new_reviews.js >> C:\dev\sagiden-search\scraper\new_reviews.log 2>&1
