@echo off
chcp 65001 >nul
title 停止微信小程序后端服务器

echo ========================================
echo    停止微信小程序后端服务器
echo ========================================

echo 🔍 正在查找运行中的服务器进程...

:: 方法1：通过端口查找并停止进程
echo 📍 方法1：通过端口5000查找进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo 🔍 找到进程ID: %%a
    echo 🛑 正在停止进程 %%a...
    taskkill /PID %%a /F >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  进程 %%a 停止失败，尝试其他方法...
    ) else (
        echo ✅ 进程 %%a 已成功停止
    )
)

:: 方法2：通过进程名查找并停止
echo 📍 方法2：通过进程名查找...
tasklist /FI "IMAGENAME eq node.exe" /FO CSV | findstr "node.exe" >nul
if not errorlevel 1 (
    echo 🔍 找到node.exe进程，正在停止...
    taskkill /IM node.exe /F >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  node.exe进程停止失败
    ) else (
        echo ✅ node.exe进程已成功停止
    )
)

:: 方法3：通过命令行参数查找
echo 📍 方法3：查找包含server.js的进程...
wmic process where "commandline like '%%server.js%%'" get processid /format:csv | findstr /v "ProcessId" | findstr /v "^$" > temp_pids.txt
if exist temp_pids.txt (
    for /f "tokens=2 delims=," %%a in (temp_pids.txt) do (
        echo 🔍 找到server.js进程ID: %%a
        echo 🛑 正在停止进程 %%a...
        taskkill /PID %%a /F >nul 2>&1
        if errorlevel 1 (
            echo ⚠️  进程 %%a 停止失败
        ) else (
            echo ✅ 进程 %%a 已成功停止
        )
    )
    del temp_pids.txt
)

:: 等待一下让进程完全停止
timeout /t 2 /nobreak >nul

:: 最终检查
echo.
echo 🔍 最终检查服务器状态...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo ✅ 确认：服务器已成功停止，端口5000已释放
) else (
    echo ❌ 警告：仍有进程占用5000端口
    echo 💡 建议：
    echo    1. 以管理员身份运行此脚本
    echo    2. 手动检查任务管理器
    echo    3. 重启电脑
)

echo.
echo 🎉 停止操作完成！
pause 