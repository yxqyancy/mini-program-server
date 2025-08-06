// 生产环境配置
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    // 初始化全局数据 - 生产环境
    this.globalData = {
      isAdmin: false, // 全局管理员状态
      adminPassword: 'admin123', // 默认管理员密码
      serverUrl: 'https://your-app-name.onrender.com' // 替换为你的Render地址
    }
    
    // 从本地存储加载管理员密码
    const savedPassword = wx.getStorageSync('adminPassword')
    if (savedPassword) {
      this.globalData.adminPassword = savedPassword
    }

    // 初始化时从服务器加载数据
    this.loadDataFromServer()
  },

  globalData: {
    isAdmin: false,
    adminPassword: 'admin123',
    serverUrl: 'https://your-app-name.onrender.com' // 替换为你的Render地址
  },

  // 从服务器加载数据
  async loadDataFromServer() {
    try {
      // 加载部门信息
      const departmentRes = await this.requestServer('/api/department', 'GET')
      if (departmentRes.status === 'success') {
        wx.setStorageSync('departmentMembers', departmentRes.data || [])
      }

      // 加载管理员信息
      const adminRes = await this.requestServer('/api/admin', 'GET')
      if (adminRes.status === 'success' && adminRes.data.password) {
        this.globalData.adminPassword = adminRes.data.password
        wx.setStorageSync('adminPassword', adminRes.data.password)
      }
    } catch (error) {
      console.error('从服务器加载数据失败:', error)
    }
  },

  // 通用服务器请求方法
  requestServer(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.serverUrl + url,
        method: method,
        data: data,
        header: {
          'content-type': 'application/json'
        },
        timeout: 10000,
        success: (res) => {
          resolve(res.data)
        },
        fail: (error) => {
          console.error('服务器请求失败:', error)
          reject(error)
        }
      })
    })
  },

  // 全局验证管理员密码
  async verifyAdminPassword(password) {
    try {
      const result = await this.requestServer('/api/admin/verify', 'POST', {
        password: password
      })
      
      if (result.status === 'success' && result.is_admin) {
        this.globalData.isAdmin = true
        return true
      } else {
        this.globalData.isAdmin = false
        return false
      }
    } catch (error) {
      console.error('验证管理员密码失败:', error)
      const isCorrect = password === this.globalData.adminPassword
      this.globalData.isAdmin = isCorrect
      return isCorrect
    }
  },

  // 检查当前是否为管理员
  checkAdminStatus() {
    return this.globalData.isAdmin
  },

  // 设置管理员状态
  setAdminStatus(status) {
    this.globalData.isAdmin = status
  },

  // 获取管理员密码
  getAdminPassword() {
    return this.globalData.adminPassword
  },

  // 设置管理员密码
  async setAdminPassword(newPassword) {
    try {
      const result = await this.requestServer('/api/admin', 'POST', {
        password: newPassword
      })
      
      if (result.status === 'success') {
        this.globalData.adminPassword = newPassword
        wx.setStorageSync('adminPassword', newPassword)
        return true
      }
      return false
    } catch (error) {
      console.error('设置管理员密码失败:', error)
      this.globalData.adminPassword = newPassword
      wx.setStorageSync('adminPassword', newPassword)
      return true
    }
  },

  // 清除管理员状态
  logout() {
    this.globalData.isAdmin = false
  },

  // 保存部门信息到服务器
  async saveDepartmentToServer(members) {
    try {
      const result = await this.requestServer('/api/department', 'POST', {
        members: members
      })
      return result.status === 'success'
    } catch (error) {
      console.error('保存部门信息到服务器失败:', error)
      return false
    }
  },

  // 从服务器获取部门信息
  async getDepartmentFromServer() {
    try {
      const result = await this.requestServer('/api/department', 'GET')
      if (result.status === 'success') {
        return result.data
      }
      return []
    } catch (error) {
      console.error('从服务器获取部门信息失败:', error)
      return []
    }
  }
}) 