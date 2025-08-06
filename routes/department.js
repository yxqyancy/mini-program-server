const express = require('express');
const router = express.Router();
const db = require('../utils/database');

// 获取部门成员列表
router.get('/', async (req, res) => {
  try {
    const members = db.getAll('department_members');
    
    res.json({
      status: 'success',
      data: members
    });
  } catch (error) {
    console.error('获取部门成员失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 保存部门成员列表
router.post('/', async (req, res) => {
  try {
    const { members } = req.body;
    
    if (!Array.isArray(members)) {
      return res.status(400).json({
        status: 'error',
        message: '成员数据格式错误'
      });
    }

    // 清空现有数据并插入新数据
    const newMembers = members.map((member, index) => ({
      id: index + 1,
      photo: member.photo || '',
      name: member.name || '',
      description: member.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    db.setCollection('department_members', newMembers);
    
    res.json({
      status: 'success',
      message: '部门成员保存成功',
      count: members.length
    });
  } catch (error) {
    console.error('保存部门成员失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 添加单个部门成员
router.post('/member', async (req, res) => {
  try {
    const { photo, name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: '成员姓名不能为空'
      });
    }

    const result = db.run('department_members', {
      photo: photo || '',
      name: name,
      description: description || ''
    });
    
    res.json({
      status: 'success',
      message: '成员添加成功',
      data: {
        id: result.id,
        photo: photo || '',
        name: name,
        description: description || ''
      }
    });
  } catch (error) {
    console.error('添加部门成员失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 更新单个部门成员
router.put('/member/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { photo, name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: '成员姓名不能为空'
      });
    }

    const result = db.update('department_members', parseInt(id), {
      photo: photo || '',
      name: name,
      description: description || ''
    });
    
    if (result.changes === 0) {
      return res.status(404).json({
        status: 'error',
        message: '成员不存在'
      });
    }
    
    res.json({
      status: 'success',
      message: '成员更新成功'
    });
  } catch (error) {
    console.error('更新部门成员失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 删除单个部门成员
router.delete('/member/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = db.delete('department_members', parseInt(id));
    
    if (result.changes === 0) {
      return res.status(404).json({
        status: 'error',
        message: '成员不存在'
      });
    }
    
    res.json({
      status: 'success',
      message: '成员删除成功'
    });
  } catch (error) {
    console.error('删除部门成员失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 获取单个部门成员
router.get('/member/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const member = db.get('department_members', parseInt(id));
    
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: '成员不存在'
      });
    }
    
    res.json({
      status: 'success',
      data: member
    });
  } catch (error) {
    console.error('获取部门成员失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

module.exports = router; 