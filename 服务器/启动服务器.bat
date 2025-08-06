@echo off
chcp 65001 >nul
title 微信小程序后端服务器 - 后台运行

echo ========================================
echo    微信小程序后端服务器启动脚本
echo ========================================

:: 检查是否已有服务器在运行
echo 🔍 检查是否已有服务器在运行...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo ⚠️  检测到端口5000已被占用
    echo 💡 建议先运行 stop-server.bat 停止现有服务器
    echo.
    set /p choice="是否继续启动新服务器？(y/n): "
    if /i not "%choice%"=="y" (
        echo ❌ 用户取消操作
        pause
        exit /b 1
    )
)

echo 正在检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js环境未安装，请先安装Node.js
    pause
    exit /b 1
)
echo ✅ Node.js环境检查通过

echo.
echo 正在检查依赖包...
if not exist "node_modules" (
    echo 📦 正在安装依赖包...
    npm install
    if errorlevel 1 (
        echo ❌ 依赖包安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖包安装完成
) else (
    echo ✅ 依赖包已存在
)

echo.
echo 🚀 正在后台启动服务器...
echo 📍 服务器地址: http://localhost:5000
echo 📍 局域网地址: http://192.168.110.33:5000
echo 📁 数据库文件: data/app.json
echo.
echo 💡 提示：服务器将在后台运行，关闭此窗口不会停止服务器
echo 💡 如需停止服务器，请运行 stop-server.bat
echo.

:: 创建启动日志文件
echo [%date% %time%] 服务器启动中... > server.log

:: 使用 start 命令在后台启动服务器，并重定向输出
start /B cmd /c "node server.js >> server.log 2>&1"

echo ✅ 服务器启动命令已执行！
echo.
echo 🔍 等待服务器启动...
timeout /t 5 /nobreak >nul

:: 多次检查服务器是否成功启动
set "started=false"
for /l %%i in (1,1,3) do (
    echo 🔍 第%%i次检查服务器状态...
    netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
    if not errorlevel 1 (
        set "started=true"
        echo ✅ 服务器运行正常！
        goto :server_started
    )
    timeout /t 2 /nobreak >nul
)

:server_started
if "%started%"=="true" (
    echo.
    echo 🎉 服务器启动成功！
    echo 📱 小程序可以正常连接服务器进行多端同步
    echo 📄 服务器日志保存在: server.log
    echo.
    echo 💡 重要提示：
    echo    1. 服务器现在在后台运行，关闭此窗口不会停止服务器
    echo    2. 如需停止服务器，请运行 stop-server.bat
    echo    3. 如需查看服务器状态，请运行 check-server.bat
    echo    4. 服务器日志保存在 server.log 文件中
) else (
    echo ❌ 服务器启动失败
    echo 💡 可能的原因：
    echo    1. 端口5000被其他程序占用
    echo    2. Node.js环境问题
    echo    3. 依赖包安装不完整
    echo.
    echo 📄 请查看 server.log 文件了解详细错误信息
)

echo.
pause 