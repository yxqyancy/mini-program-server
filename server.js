const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// 导入路由模块
const adminRoutes = require('./routes/admin');
const departmentRoutes = require('./routes/department');
const workGuideRoutes = require('./routes/workGuide');
const lifeGuideRoutes = require('./routes/lifeGuide');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件配置
app.use(cors({
  origin: '*', // 允许所有来源，生产环境应该限制
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 创建必要的目录
const dirs = ['uploads', 'uploads/images', 'uploads/files', 'data'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 路由配置
app.use('/api/admin', adminRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/work-guide', workGuideRoutes);
app.use('/api/life-guide', lifeGuideRoutes);
app.use('/api/upload', uploadRoutes);

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: '服务器运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '微信小程序后端服务器',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      admin: '/api/admin',
      department: '/api/department',
      workGuide: '/api/work-guide',
      lifeGuide: '/api/life-guide',
      upload: '/api/upload'
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    status: 'error',
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '未知错误'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: '接口不存在',
    path: req.originalUrl
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器启动成功！`);
  console.log(`📍 服务器地址: http://localhost:${PORT}`);
  console.log(`🌐 端口: ${PORT}`);
  console.log(`📱 小程序配置: 请在小程序开发工具中设置服务器域名`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
});

module.exports = app; 