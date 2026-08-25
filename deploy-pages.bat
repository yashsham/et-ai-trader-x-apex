@echo off
echo ===================================================
echo   ET AI Trader X-Apex — Cloudflare Pages Deployer
echo ===================================================
echo.
echo Make sure you have built your backend-worker and deployed it first,
echo so you can supply the VITE_API_URL variable.
echo.

set /p API_URL="Enter your backend worker production URL (e.g. https://et-ai-trader-backend.yourname.workers.dev): "
if "%API_URL%"=="" (
    echo Error: Backend API URL is required.
    exit /b 1
)

echo Setting VITE_API_URL=%API_URL%...
set VITE_API_URL=%API_URL%

echo.
echo Installing frontend dependencies...
call npm install

echo.
echo Building frontend production assets...
call npm run build

echo.
echo Deploying dist directory to Cloudflare Pages...
npx wrangler pages deploy dist --project-name=et-ai-trader-x-apex

echo.
echo Done! Your frontend is deployed to Cloudflare Pages.
pause
