// 首页逻辑
const app = getApp()

Page({
  data: {
    isAdmin: false,
    showPasswordModal: false,
    showPasswordSettingModal: false,
    currentPassword: '',
    adminPassword: '',
    // 服务器连接状态
    serverStatus: {
      connected: false,
      loading: false,
      lastCheck: null,
      error: null
    }
  },

  onLoad() {
    // 页面加载时的逻辑
    this.checkAdminStatus()
    // 检查服务器连接状态
    this.checkServerConnection()
  },

  onShow() {
    // 每次显示页面时检查管理员状态
    this.checkAdminStatus()
    // 检查服务器连接状态
    this.checkServerConnection()
  },

  // 检查管理员状态
  checkAdminStatus() {
    const isAdmin = app.checkAdminStatus()
    this.setData({
      isAdmin: isAdmin
    })
  },

  // 检查服务器连接状态
  async checkServerConnection() {
    this.setData({
      'serverStatus.loading': true,
      'serverStatus.error': null
    })

    try {
      // 测试服务器连接
      const result = await app.requestServer('/', 'GET')
      
      if (result && result.status === 'success') {
        this.setData({
          'serverStatus.connected': true,
          'serverStatus.lastCheck': new Date().toLocaleString(),
          'serverStatus.loading': false
        })
      } else {
        throw new Error('服务器响应异常')
      }
    } catch (error) {
      console.error('服务器连接检查失败:', error)
      this.setData({
        'serverStatus.connected': false,
        'serverStatus.error': error.errMsg || '连接失败',
        'serverStatus.lastCheck': new Date().toLocaleString(),
        'serverStatus.loading': false
      })
    }
  },

  // 手动测试服务器连接
  async testServerConnection() {
    wx.showLoading({
      title: '测试连接中...'
    })

    try {
      await this.checkServerConnection()
      
      if (this.data.serverStatus.connected) {
        wx.showToast({
          title: '连接成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '连接失败',
          icon: 'error'
        })
      }
    } catch (error) {
      wx.showToast({
        title: '测试失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 重新连接服务器
  async reconnectServer() {
    wx.showLoading({
      title: '重新连接中...'
    })

    try {
      await this.checkServerConnection()
      
      if (this.data.serverStatus.connected) {
        wx.showToast({
          title: '重连成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '重连失败',
          icon: 'error'
        })
      }
    } catch (error) {
      wx.showToast({
        title: '重连失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 网络诊断功能
  async diagnoseNetwork() {
    wx.showLoading({
      title: '诊断中...'
    })

    const results = {
      serverReachable: false,
      apiTest: false,
      passwordTest: false,
      error: null
    }

    try {
      // 测试1：基础连接
      console.log('=== 开始网络诊断 ===')
      
      const basicTest = await app.requestServer('/', 'GET')
      results.serverReachable = basicTest && basicTest.status === 'success'
      console.log('基础连接测试:', results.serverReachable)

      if (results.serverReachable) {
        // 测试2：API功能
        const apiTest = await app.requestServer('/api/admin', 'GET')
        results.apiTest = apiTest && apiTest.status === 'success'
        console.log('API功能测试:', results.apiTest)

        // 测试3：密码验证
        const passwordTest = await app.requestServer('/api/admin/verify', 'POST', {
          password: 'admin123'
        })
        results.passwordTest = passwordTest && passwordTest.status === 'success'
        console.log('密码验证测试:', results.passwordTest)
      }

    } catch (error) {
      console.error('网络诊断失败:', error)
      results.error = error.errMsg || '未知错误'
    }

    wx.hideLoading()

    // 显示诊断结果
    let message = '网络诊断结果:\n'
    message += `服务器连接: ${results.serverReachable ? '✅' : '❌'}\n`
    message += `API功能: ${results.apiTest ? '✅' : '❌'}\n`
    message += `密码验证: ${results.passwordTest ? '✅' : '❌'}\n`
    
    if (results.error) {
      message += `错误信息: ${results.error}`
    }

    wx.showModal({
      title: '网络诊断',
      content: message,
      showCancel: false
    })

    console.log('网络诊断结果:', results)
  },

  // 测试密码验证流程
  testPasswordAuth() {
    console.log('=== 测试密码验证流程 ===')
    console.log('当前管理员状态:', this.data.isAdmin)
    
    this.setData({
      showPasswordModal: true
    })
  },

  // 输入密码
  inputPassword(e) {
    this.setData({
      currentPassword: e.detail.value
    })
  },

  // 验证密码
  async verifyPassword() {
    const password = this.data.currentPassword.trim()
    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'error'
      })
      return
    }

    console.log('开始验证密码...')
    wx.showLoading({
      title: '验证中...'
    })

    try {
      const isCorrect = await app.verifyAdminPassword(password)
      console.log('密码验证结果:', isCorrect)
      
      if (isCorrect) {
        console.log('密码验证成功，设置管理员状态')
        this.setData({
          isAdmin: true,
          showPasswordModal: false,
          currentPassword: ''
        })
        wx.showToast({
          title: '验证成功！',
          icon: 'success'
        })
      } else {
        console.log('密码验证失败')
        this.setData({
          currentPassword: ''
        })
        wx.showToast({
          title: '密码错误',
          icon: 'error'
        })
      }
    } catch (error) {
      console.error('验证失败:', error)
      wx.showToast({
        title: '验证失败，请检查网络连接',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 取消密码验证
  cancelPasswordAuth() {
    this.setData({
      showPasswordModal: false,
      currentPassword: ''
    })
  },

  // 导航到部门简介
  goToDepartment() {
    wx.switchTab({
      url: '/pages/department/department'
    })
  },

  // 导航到工作指南
  goToWorkGuide() {
    wx.switchTab({
      url: '/pages/work-guide/work-guide'
    })
  },

  // 导航到生活指南
  goToLifeGuide() {
    wx.switchTab({
      url: '/pages/life-guide/life-guide'
    })
  },

  // 显示密码设置
  showPasswordSetting() {
    this.setData({
      showPasswordSettingModal: true,
      adminPassword: app.getAdminPassword()
    })
  },

  // 隐藏密码设置
  hidePasswordSetting() {
    this.setData({
      showPasswordSettingModal: false,
      adminPassword: ''
    })
  },

  // 设置新密码
  async setNewPassword() {
    const newPassword = this.data.adminPassword.trim()
    if (newPassword) {
      try {
        const success = await app.setAdminPassword(newPassword)
        if (success) {
          this.setData({
            adminPassword: '',
            showPasswordSettingModal: false
          })
          wx.showToast({
            title: '密码设置成功',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: '密码设置失败',
            icon: 'error'
          })
        }
      } catch (error) {
        wx.showToast({
          title: '密码设置失败',
          icon: 'error'
        })
      }
    }
  },

  // 输入新密码
  inputNewPassword(e) {
    this.setData({
      adminPassword: e.detail.value
    })
  },

  // 退出登录
  logout() {
    app.logout()
    this.setData({
      isAdmin: false
    })
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    })
  }
}) 