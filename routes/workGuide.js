const express = require('express');
const router = express.Router();
const db = require('../utils/database');

// ==================== 工作流程 ====================

// 获取工作流程列表
router.get('/workflows', async (req, res) => {
  try {
    const workflows = db.getAll('workflows');
    
    res.json({
      status: 'success',
      data: workflows
    });
  } catch (error) {
    console.error('获取工作流程失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 保存工作流程列表
router.post('/workflows', async (req, res) => {
  try {
    const { workflows } = req.body;
    
    if (!Array.isArray(workflows)) {
      return res.status(400).json({
        status: 'error',
        message: '工作流程数据格式错误'
      });
    }

    // 清空现有数据并插入新数据
    const newWorkflows = workflows.map((workflow, index) => ({
      id: index + 1,
      title: workflow.title || '',
      description: workflow.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    db.setCollection('workflows', newWorkflows);
    
    res.json({
      status: 'success',
      message: '工作流程保存成功',
      count: workflows.length
    });
  } catch (error) {
    console.error('保存工作流程失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// ==================== 注意事项 ====================

// 获取注意事项列表
router.get('/notices', async (req, res) => {
  try {
    const notices = db.getAll('notices');
    
    res.json({
      status: 'success',
      data: notices
    });
  } catch (error) {
    console.error('获取注意事项失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 保存注意事项列表
router.post('/notices', async (req, res) => {
  try {
    const { notices } = req.body;
    
    if (!Array.isArray(notices)) {
      return res.status(400).json({
        status: 'error',
        message: '注意事项数据格式错误'
      });
    }

    // 清空现有数据并插入新数据
    const newNotices = notices.map((notice, index) => ({
      id: index + 1,
      title: notice.title || '',
      content: notice.content || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    db.setCollection('notices', newNotices);
    
    res.json({
      status: 'success',
      message: '注意事项保存成功',
      count: notices.length
    });
  } catch (error) {
    console.error('保存注意事项失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// ==================== 实用工具 ====================

// 获取实用工具列表
router.get('/tools', async (req, res) => {
  try {
    const tools = db.getAll('tools');
    
    res.json({
      status: 'success',
      data: tools
    });
  } catch (error) {
    console.error('获取实用工具失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 保存实用工具列表
router.post('/tools', async (req, res) => {
  try {
    const { tools } = req.body;
    
    if (!Array.isArray(tools)) {
      return res.status(400).json({
        status: 'error',
        message: '实用工具数据格式错误'
      });
    }

    // 清空现有数据并插入新数据
    const newTools = tools.map((tool, index) => ({
      id: index + 1,
      name: tool.name || '',
      description: tool.description || '',
      url: tool.url || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    db.setCollection('tools', newTools);
    
    res.json({
      status: 'success',
      message: '实用工具保存成功',
      count: tools.length
    });
  } catch (error) {
    console.error('保存实用工具失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// ==================== 工作材料 ====================

// 获取工作材料列表
router.get('/materials', async (req, res) => {
  try {
    const materials = db.getAll('materials');
    
    res.json({
      status: 'success',
      data: materials
    });
  } catch (error) {
    console.error('获取工作材料失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 保存工作材料列表
router.post('/materials', async (req, res) => {
  try {
    const { materials } = req.body;
    
    if (!Array.isArray(materials)) {
      return res.status(400).json({
        status: 'error',
        message: '工作材料数据格式错误'
      });
    }

    // 清空现有数据并插入新数据
    const newMaterials = materials.map((material, index) => ({
      id: index + 1,
      name: material.name || '',
      file_path: material.filePath || '',
      file_name: material.fileName || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    db.setCollection('materials', newMaterials);
    
    res.json({
      status: 'success',
      message: '工作材料保存成功',
      count: materials.length
    });
  } catch (error) {
    console.error('保存工作材料失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// ==================== 获取所有工作指南数据 ====================

// 获取完整的工作指南数据
router.get('/', async (req, res) => {
  try {
    const workflows = db.getAll('workflows');
    const notices = db.getAll('notices');
    const tools = db.getAll('tools');
    const materials = db.getAll('materials');
    
    res.json({
      status: 'success',
      data: {
        workflows,
        notices,
        tools,
        materials
      }
    });
  } catch (error) {
    console.error('获取工作指南数据失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 保存完整的工作指南数据
router.post('/', async (req, res) => {
  try {
    const { workflows, notices, tools, materials } = req.body;
    
    // 验证数据格式
    if (!Array.isArray(workflows) || !Array.isArray(notices) || 
        !Array.isArray(tools) || !Array.isArray(materials)) {
      return res.status(400).json({
        status: 'error',
        message: '数据格式错误'
      });
    }

    // 清空并重新设置所有数据
    const newWorkflows = workflows.map((workflow, index) => ({
      id: index + 1,
      title: workflow.title || '',
      description: workflow.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const newNotices = notices.map((notice, index) => ({
      id: index + 1,
      title: notice.title || '',
      content: notice.content || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const newTools = tools.map((tool, index) => ({
      id: index + 1,
      name: tool.name || '',
      description: tool.description || '',
      url: tool.url || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const newMaterials = materials.map((material, index) => ({
      id: index + 1,
      name: material.name || '',
      file_path: material.filePath || '',
      file_name: material.fileName || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    db.setCollection('workflows', newWorkflows);
    db.setCollection('notices', newNotices);
    db.setCollection('tools', newTools);
    db.setCollection('materials', newMaterials);
    
    res.json({
      status: 'success',
      message: '工作指南数据保存成功',
      data: {
        workflows: workflows.length,
        notices: notices.length,
        tools: tools.length,
        materials: materials.length
      }
    });
  } catch (error) {
    console.error('保存工作指南数据失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

module.exports = router; 