const express = require('express');
const router = express.Router();
const db = require('../utils/database');

// 获取生活指南数据
router.get('/', async (req, res) => {
  try {
    const sections = db.getAll('life_guide');
    
    // 将数据转换为对象格式
    const lifeGuide = {
      foods: [],
      teamBuildings: [],
      moneys: [],
      maps: []
    };
    
    sections.forEach(section => {
      try {
        const data = JSON.parse(section.data);
        switch (section.section) {
          case 'foods':
            lifeGuide.foods = data;
            break;
          case 'teamBuildings':
            lifeGuide.teamBuildings = data;
            break;
          case 'moneys':
            lifeGuide.moneys = data;
            break;
          case 'maps':
            lifeGuide.maps = data;
            break;
        }
      } catch (error) {
        console.error(`解析${section.section}数据失败:`, error);
      }
    });
    
    res.json({
      status: 'success',
      data: lifeGuide
    });
  } catch (error) {
    console.error('获取生活指南数据失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 保存生活指南数据
router.post('/', async (req, res) => {
  try {
    const { foods, teamBuildings, moneys, maps } = req.body;
    
    // 验证数据格式
    if (!Array.isArray(foods) || !Array.isArray(teamBuildings) || 
        !Array.isArray(moneys) || !Array.isArray(maps)) {
      return res.status(400).json({
        status: 'error',
        message: '数据格式错误'
      });
    }

    // 清空现有数据并插入新数据
    const sections = [
      { section: 'foods', data: foods },
      { section: 'teamBuildings', data: teamBuildings },
      { section: 'moneys', data: moneys },
      { section: 'maps', data: maps }
    ];
    
    const newSections = sections.map((section, index) => ({
      id: index + 1,
      section: section.section,
      data: JSON.stringify(section.data),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    db.setCollection('life_guide', newSections);
    
    res.json({
      status: 'success',
      message: '生活指南数据保存成功',
      data: {
        foods: foods.length,
        teamBuildings: teamBuildings.length,
        moneys: moneys.length,
        maps: maps.length
      }
    });
  } catch (error) {
    console.error('保存生活指南数据失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// ==================== 美食相关 ====================

// 获取美食列表
router.get('/foods', async (req, res) => {
  try {
    const section = db.query('life_guide', { section: 'foods' })[0];
    
    let foods = [];
    if (section) {
      try {
        foods = JSON.parse(section.data);
      } catch (error) {
        console.error('解析美食数据失败:', error);
      }
    }
    
    res.json({
      status: 'success',
      data: foods
    });
  } catch (error) {
    console.error('获取美食列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 保存美食列表
router.post('/foods', async (req, res) => {
  try {
    const { foods } = req.body;
    
    if (!Array.isArray(foods)) {
      return res.status(400).json({
        status: 'error',
        message: '美食数据格式错误'
      });
    }

    // 查找现有记录
    const existingSection = db.query('life_guide', { section: 'foods' })[0];
    
    if (existingSection) {
      // 更新现有记录
      db.update('life_guide', existingSection.id, {
        data: JSON.stringify(foods)
      });
    } else {
      // 创建新记录
      db.run('life_guide', {
        section: 'foods',
        data: JSON.stringify(foods)
      });
    }
    
    res.json({
      status: 'success',
      message: '美食数据保存成功',
      count: foods.length
    });
  } catch (error) {
    console.error('保存美食数据失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// ==================== 团建相关 ====================

// 获取团建列表
router.get('/team-buildings', async (req, res) => {
  try {
    const section = db.query('life_guide', { section: 'teamBuildings' })[0];
    
    let teamBuildings = [];
    if (section) {
      try {
        teamBuildings = JSON.parse(section.data);
      } catch (error) {
        console.error('解析团建数据失败:', error);
      }
    }
    
    res.json({
      status: 'success',
      data: teamBuildings
    });
  } catch (error) {
    console.error('获取团建列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 保存团建列表
router.post('/team-buildings', async (req, res) => {
  try {
    const { teamBuildings } = req.body;
    
    if (!Array.isArray(teamBuildings)) {
      return res.status(400).json({
        status: 'error',
        message: '团建数据格式错误'
      });
    }

    // 查找现有记录
    const existingSection = db.query('life_guide', { section: 'teamBuildings' })[0];
    
    if (existingSection) {
      // 更新现有记录
      db.update('life_guide', existingSection.id, {
        data: JSON.stringify(teamBuildings)
      });
    } else {
      // 创建新记录
      db.run('life_guide', {
        section: 'teamBuildings',
        data: JSON.stringify(teamBuildings)
      });
    }
    
    res.json({
      status: 'success',
      message: '团建数据保存成功',
      count: teamBuildings.length
    });
  } catch (error) {
    console.error('保存团建数据失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// ==================== 赚钱相关 ====================

// 获取赚钱列表
router.get('/moneys', async (req, res) => {
  try {
    const section = db.query('life_guide', { section: 'moneys' })[0];
    
    let moneys = [];
    if (section) {
      try {
        moneys = JSON.parse(section.data);
      } catch (error) {
        console.error('解析赚钱数据失败:', error);
      }
    }
    
    res.json({
      status: 'success',
      data: moneys
    });
  } catch (error) {
    console.error('获取赚钱列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 保存赚钱列表
router.post('/moneys', async (req, res) => {
  try {
    const { moneys } = req.body;
    
    if (!Array.isArray(moneys)) {
      return res.status(400).json({
        status: 'error',
        message: '赚钱数据格式错误'
      });
    }

    // 查找现有记录
    const existingSection = db.query('life_guide', { section: 'moneys' })[0];
    
    if (existingSection) {
      // 更新现有记录
      db.update('life_guide', existingSection.id, {
        data: JSON.stringify(moneys)
      });
    } else {
      // 创建新记录
      db.run('life_guide', {
        section: 'moneys',
        data: JSON.stringify(moneys)
      });
    }
    
    res.json({
      status: 'success',
      message: '赚钱数据保存成功',
      count: moneys.length
    });
  } catch (error) {
    console.error('保存赚钱数据失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// ==================== 校园地图相关 ====================

// 获取校园地图列表
router.get('/maps', async (req, res) => {
  try {
    const section = db.query('life_guide', { section: 'maps' })[0];
    
    let maps = [];
    if (section) {
      try {
        maps = JSON.parse(section.data);
      } catch (error) {
        console.error('解析校园地图数据失败:', error);
      }
    }
    
    res.json({
      status: 'success',
      data: maps
    });
  } catch (error) {
    console.error('获取校园地图列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

// 保存校园地图列表
router.post('/maps', async (req, res) => {
  try {
    const { maps } = req.body;
    
    if (!Array.isArray(maps)) {
      return res.status(400).json({
        status: 'error',
        message: '校园地图数据格式错误'
      });
    }

    // 查找现有记录
    const existingSection = db.query('life_guide', { section: 'maps' })[0];
    
    if (existingSection) {
      // 更新现有记录
      db.update('life_guide', existingSection.id, {
        data: JSON.stringify(maps)
      });
    } else {
      // 创建新记录
      db.run('life_guide', {
        section: 'maps',
        data: JSON.stringify(maps)
      });
    }
    
    res.json({
      status: 'success',
      message: '校园地图数据保存成功',
      count: maps.length
    });
  } catch (error) {
    console.error('保存校园地图数据失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误'
    });
  }
});

module.exports = router; 