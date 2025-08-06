@echo off
chcp 65001 >nul
title PM2服务器管理器

echo ========================================
echo    PM2服务器管理器
echo ========================================

echo 请选择操作：
echo.
echo 1. 启动服务器
echo 2. 停止服务器
echo 3. 重启服务器
echo 4. 查看服务器状态
echo 5. 查看服务器日志
echo 6. 安装为Windows服务
echo 7. 卸载Windows服务
echo 8. 退出
echo.

set /p choice="请输入选项 (1-8): "

if "%choice%"=="1" goto :start_server
if "%choice%"=="2" goto :stop_server
if "%choice%"=="3" goto :restart_server
if "%choice%"=="4" goto :status_server
if "%choice%"=="5" goto :logs_server
if "%choice%"=="6" goto :install_service
if "%choice%"=="7" goto :uninstall_service
if "%choice%"=="8" goto :exit
goto :invalid_choice

:start_server
echo.
echo 🚀 正在启动服务器...
pm2 start server.js --name "wechat-miniprogram-server"
echo ✅ 服务器启动命令已执行
goto :end

:stop_server
echo.
echo 🛑 正在停止服务器...
pm2 stop wechat-miniprogram-server
echo ✅ 服务器停止命令已执行
goto :end

:restart_server
echo.
echo 🔄 正在重启服务器...
pm2 restart wechat-miniprogram-server
echo ✅ 服务器重启命令已执行
goto :end

:status_server
echo.
echo 📊 服务器状态：
pm2 status
goto :end

:logs_server
echo.
echo 📄 服务器日志：
pm2 logs wechat-miniprogram-server --lines 50
goto :end

:install_service
echo.
echo 🔧 正在安装为Windows服务...
pm2 startup
echo ✅ Windows服务安装命令已执行
echo 💡 请按照提示完成服务安装
goto :end

:uninstall_service
echo.
echo 🗑️  正在卸载Windows服务...
pm2 unstartup
echo ✅ Windows服务卸载命令已执行
goto :end

:invalid_choice
echo.
echo ❌ 无效选项，请重新选择
goto :end

:end
echo.
echo 按任意键返回主菜单...
pause >nul
cls
goto :eof

:exit
echo.
echo 👋 再见！
timeout /t 2 /nobreak >nul
exit 