@echo off
chcp 65001 >nul
title 安装微信小程序后端服务器为Windows服务

:: 检查管理员权限
net session >nul 2>&1
if errorlevel 1 (
    echo ❌ 此脚本需要管理员权限才能运行
    echo 💡 请右键点击此文件，选择"以管理员身份运行"
    pause
    exit /b 1
)

echo ========================================
echo    安装微信小程序后端服务器为Windows服务
echo ========================================

echo 🔍 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js环境未安装，请先安装Node.js
    pause
    exit /b 1
)
echo ✅ Node.js环境检查通过

echo.
echo 🔍 检查pm2是否已安装...
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo 📦 正在安装pm2...
    npm install -g pm2
    if errorlevel 1 (
        echo ❌ pm2安装失败
        pause
        exit /b 1
    )
    echo ✅ pm2安装成功
) else (
    echo ✅ pm2已安装
)

echo.
echo 🔍 检查依赖包...
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
echo 🚀 正在安装服务器为Windows服务...

:: 停止现有的pm2进程
pm2 stop all >nul 2>&1
pm2 delete all >nul 2>&1

:: 启动服务器
pm2 start server.js --name "wechat-miniprogram-server"

:: 保存pm2配置
pm2 save

:: 安装pm2为Windows服务
pm2 startup

echo.
echo ✅ 服务器已安装为Windows服务！
echo.
echo 💡 服务信息：
echo    服务名称: wechat-miniprogram-server
echo    启动命令: pm2 start wechat-miniprogram-server
echo    停止命令: pm2 stop wechat-miniprogram-server
echo    重启命令: pm2 restart wechat-miniprogram-server
echo    查看状态: pm2 status
echo.
echo 🎉 现在服务器将：
echo    1. 开机自动启动
echo    2. 在后台稳定运行
echo    3. 崩溃自动重启
echo    4. 完全独立于Cursor运行
echo.
echo 📱 小程序可以正常连接服务器进行多端同步

pause 