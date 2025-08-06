@echo off
chcp 65001 >nul
title 检查微信小程序后端服务器状态

echo ========================================
echo    检查微信小程序后端服务器状态
echo ========================================

echo 🔍 正在检查服务器状态...

:: 检查端口占用情况
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo ❌ 服务器未运行
    echo 💡 建议：运行 start-server-background.bat 启动服务器
) else (
    echo ✅ 服务器正在运行
    echo.
    echo 📍 服务器地址信息：
    echo   本地访问: http://localhost:5000
    echo   局域网访问: http://192.168.110.33:5000
    echo.
    echo 📁 数据库文件: data/app.json
    echo.
    echo 💡 如需停止服务器，请运行 stop-server.bat
)

echo.
echo 🎉 检查完成！
pause 