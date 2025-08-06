const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

class DatabaseManager {
  constructor() {
    this.dbPath = path.join(__dirname, '../data/app.json');
    this.db = null;
    this.init();
  }

  init() {
    // 确保数据目录存在
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const adapter = new FileSync(this.dbPath);
    this.db = low(adapter);

    // 设置默认数据结构
    this.db.defaults({
      admin: [],
      department_members: [],
      workflows: [],
      notices: [],
      tools: [],
      materials: [],
      life_guide: []
    }).write();

    console.log('✅ 数据库连接成功');
    this.initDefaultAdmin();
  }

  initDefaultAdmin() {
    const admin = this.db.get('admin').value();
    if (admin.length === 0) {
      this.db.get('admin')
        .push({
          id: 1,
          password: 'admin123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .write();
      console.log('✅ 默认管理员密码已设置: admin123');
    }
  }

  // 通用查询方法
  query(collection, filter = {}) {
    try {
      let query = this.db.get(collection);
      
      // 应用过滤条件
      Object.keys(filter).forEach(key => {
        query = query.filter(item => item[key] === filter[key]);
      });
      
      return query.value();
    } catch (err) {
      console.error('查询失败:', err.message);
      throw err;
    }
  }

  // 通用执行方法（插入）
  run(collection, data) {
    try {
      const id = this.getNextId(collection);
      const newItem = {
        id,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      this.db.get(collection)
        .push(newItem)
        .write();
      
      return { id, changes: 1 };
    } catch (err) {
      console.error('插入失败:', err.message);
      throw err;
    }
  }

  // 更新方法
  update(collection, id, data) {
    try {
      const result = this.db.get(collection)
        .find({ id })
        .assign({
          ...data,
          updated_at: new Date().toISOString()
        })
        .write();
      
      return { id, changes: result ? 1 : 0 };
    } catch (err) {
      console.error('更新失败:', err.message);
      throw err;
    }
  }

  // 删除方法
  delete(collection, id) {
    try {
      const result = this.db.get(collection)
        .remove({ id })
        .write();
      
      return { id, changes: result.length };
    } catch (err) {
      console.error('删除失败:', err.message);
      throw err;
    }
  }

  // 获取单条记录
  get(collection, id) {
    try {
      return this.db.get(collection)
        .find({ id })
        .value();
    } catch (err) {
      console.error('获取记录失败:', err.message);
      throw err;
    }
  }

  // 获取下一个ID
  getNextId(collection) {
    const items = this.db.get(collection).value();
    if (items.length === 0) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
  }

  // 获取所有记录
  getAll(collection) {
    try {
      return this.db.get(collection).value();
    } catch (err) {
      console.error('获取所有记录失败:', err.message);
      throw err;
    }
  }

  // 设置整个集合
  setCollection(collection, data) {
    try {
      this.db.set(collection, data).write();
      return { changes: data.length };
    } catch (err) {
      console.error('设置集合失败:', err.message);
      throw err;
    }
  }

  // 关闭数据库连接
  close() {
    console.log('✅ 数据库连接已关闭');
  }
}

// 创建单例实例
const database = new DatabaseManager();

module.exports = database; 