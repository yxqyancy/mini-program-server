const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 根据文件类型选择存储目录
    let uploadDir = 'uploads/';
    if (file.mimetype.startsWith('image/')) {
      uploadDir += 'images/';
    } else {
      uploadDir += 'files/';
    }
    
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ];
  
  if (file.mimetype.startsWith('image/')) {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的图片格式'), false);
    }
  } else {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件格式'), false);
    }
  }
};

// 配置multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
    files: 1 // 一次只能上传一个文件
  }
});

// 上传图片
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: '没有选择文件'
      });
    }

    // 检查文件类型
    if (!req.file.mimetype.startsWith('image/')) {
      // 删除上传的文件
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        status: 'error',
        message: '只能上传图片文件'
      });
    }

    // 返回文件信息
    const fileUrl = `/uploads/images/${path.basename(req.file.filename)}`;
    
    res.json({
      status: 'success',
      message: '图片上传成功',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 上传文件
router.post('/file', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: '没有选择文件'
      });
    }

    // 返回文件信息
    const fileUrl = `/uploads/files/${path.basename(req.file.filename)}`;
    
    res.json({
      status: 'success',
      message: '文件上传成功',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 删除文件
router.delete('/file', (req, res) => {
  try {
    const { filename, type = 'files' } = req.body;
    
    if (!filename) {
      return res.status(400).json({
        status: 'error',
        message: '文件名不能为空'
      });
    }

    // 构建文件路径
    const filePath = path.join('uploads', type, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      });
    }

    // 删除文件
    fs.unlinkSync(filePath);
    
    res.json({
      status: 'success',
      message: '文件删除成功'
    });
  } catch (error) {
    console.error('删除文件失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 获取文件列表
router.get('/files', (req, res) => {
  try {
    const { type = 'files' } = req.query;
    const uploadDir = path.join('uploads', type);
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        status: 'success',
        data: []
      });
    }

    const files = fs.readdirSync(uploadDir)
      .filter(file => {
        const filePath = path.join(uploadDir, file);
        return fs.statSync(filePath).isFile();
      })
      .map(file => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          url: `/uploads/${type}/${file}`,
          created: stats.birthtime
        };
      });

    res.json({
      status: 'success',
      data: files
    });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 错误处理中间件
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: '文件大小超过限制（最大10MB）'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: '文件数量超过限制'
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
  
  res.status(500).json({
    status: 'error',
    message: '文件上传失败'
  });
});

module.exports = router; 