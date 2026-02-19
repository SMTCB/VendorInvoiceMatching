@echo off
echo Starting ngrok tunnel...
start "ngrok" "C:\Users\stcbr\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe" http 5678

echo Starting n8n...
echo (This may take a moment to initialize)
npx n8n start
pause
