const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../utils/database');

// 获取管理员信息
router.get('/', async (req, res) => {
  try {
    const admin = db.get('admin', 1);
    
    if (admin) {
      res.json({
        status: 'success',
        data: {
          password: admin.password
        }
      });
    } else {
      res.json({
        status: 'error',
        message: '管理员信息不存在'
      });
    }
  } catch (error) {
    console.error('获取管理员信息失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 设置管理员密码
router.post('/', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: '密码不能为空'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 检查是否已存在管理员
    const existingAdmin = db.get('admin', 1);
    
    if (existingAdmin) {
      // 更新现有管理员
      db.update('admin', 1, { password: hashedPassword });
    } else {
      // 创建新管理员
      db.run('admin', { password: hashedPassword });
    }
    
    res.json({
      status: 'success',
      message: '管理员密码设置成功'
    });
  } catch (error) {
    console.error('设置管理员密码失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 验证管理员密码
router.post('/verify', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: '密码不能为空'
      });
    }

    // 获取存储的密码
    const admin = db.get('admin', 1);
    
    if (!admin) {
      return res.json({
        status: 'error',
        message: '管理员信息不存在',
        is_admin: false
      });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, admin.password);
    
    res.json({
      status: 'success',
      is_admin: isMatch,
      message: isMatch ? '密码验证成功' : '密码错误'
    });
  } catch (error) {
    console.error('验证管理员密码失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
      is_admin: false
    });
  }
});

// 更新管理员密码
router.put('/', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: '旧密码和新密码都不能为空'
      });
    }

    // 获取当前密码
    const admin = db.get('admin', 1);
    
    if (!admin) {
      return res.status(404).json({
        status: 'error',
        message: '管理员信息不存在'
      });
    }

    // 验证旧密码
    const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.password);
    
    if (!isOldPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: '旧密码错误'
      });
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    db.update('admin', 1, { password: hashedNewPassword });
    
    res.json({
      status: 'success',
      message: '密码更新成功'
    });
  } catch (error) {
    console.error('更新管理员密码失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

module.exports = router; 