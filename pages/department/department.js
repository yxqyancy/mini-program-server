// department.js
const app = getApp()

Page({
  data: {
    departmentInfo: {
      name: '科技部',
      description: '科技部隶属海洋学院科协旗下承担营造"讲科学、学科学、用科学"的学院氛围，培养学院学生科学求真的精神的责任。科技部负责策划执行学院参与校科技节项目，积极完成校科协分配给海洋学院科协的任务，提高学院学生的科技节参与度和积极性，并且进行对学院科技项目的设计和逐步优化。'
    },
    // 成员介绍相关数据
    members: [
      { photo: '', name: '成员1', description: '成员简介' },
      { photo: '', name: '成员2', description: '成员简介' },
      { photo: '', name: '成员3', description: '成员简介' },
      { photo: '', name: '成员4', description: '成员简介' },
      { photo: '', name: '成员5', description: '成员简介' },
      { photo: '', name: '成员6', description: '成员简介' },
      { photo: '', name: '成员7', description: '成员简介' },
      { photo: '', name: '成员8', description: '成员简介' },
      { photo: '', name: '成员9', description: '成员简介' },
      { photo: '', name: '成员10', description: '成员简介' },
      { photo: '', name: '成员11', description: '成员简介' },
      { photo: '', name: '成员12', description: '成员简介' },
      { photo: '', name: '成员13', description: '成员简介' },
      { photo: '', name: '成员14', description: '成员简介' },
      { photo: '', name: '成员15', description: '成员简介' }
    ],
    isEditMode: false,
    isAdmin: false,
    hasUnsavedChanges: false,
    showAuthModal: false,
    showPasswordModal: false,
    showPasswordSettingModal: false,
    showSaveReminderModal: false,
    isNavigating: false,
    adminPassword: '',
    currentPassword: '',
    isLoading: false
  },

  async onLoad() {
    // 显示加载状态
    this.setData({ isLoading: true })
    
    try {
      // 优先从服务器加载数据
      const serverMembers = await app.getDepartmentFromServer()
      if (serverMembers && serverMembers.length > 0) {
        this.setData({
          members: serverMembers
        })
        // 同步到本地存储
        wx.setStorageSync('departmentMembers', serverMembers)
      } else {
        // 如果服务器没有数据，从本地存储加载
        const savedMembers = wx.getStorageSync('departmentMembers')
        if (savedMembers) {
          this.setData({
            members: savedMembers
          })
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      // 如果服务器不可用，从本地存储加载
      const savedMembers = wx.getStorageSync('departmentMembers')
      if (savedMembers) {
        this.setData({
          members: savedMembers
        })
      }
    } finally {
      this.setData({ isLoading: false })
    }
    
    // 检查全局管理员状态
    this.checkGlobalAdminStatus()
    
    // 监听页面返回事件
    this.setupNavigationGuard()
  },

  onShow() {
    // 每次显示页面时检查管理员状态
    this.checkGlobalAdminStatus()
  },

  onHide() {
    // 页面隐藏时检查是否有未保存的更改
    if (this.data.hasUnsavedChanges && this.data.isEditMode && !this.data.isNavigating) {
      // 延迟显示弹窗，确保页面状态稳定
      setTimeout(() => {
        this.setData({
          showSaveReminderModal: true
        })
      }, 100)
    }
  },

  onUnload() {
    // 页面卸载时检查是否有未保存的更改
    if (this.data.hasUnsavedChanges && this.data.isEditMode && !this.data.isNavigating) {
      // 延迟显示弹窗，确保页面状态稳定
      setTimeout(() => {
        this.setData({
          showSaveReminderModal: true
        })
      }, 100)
    }
  },

  // 检查全局管理员状态
  checkGlobalAdminStatus() {
    const isAdmin = app.checkAdminStatus()
    this.setData({
      isAdmin: isAdmin
    })
  },

  // 设置导航守卫
  setupNavigationGuard() {
    // 监听页面返回按钮点击
    wx.onAppRoute(() => {
      this.checkUnsavedChanges()
    })
  },

  // 检查未保存的更改
  checkUnsavedChanges() {
    if (this.data.hasUnsavedChanges && this.data.isEditMode && !this.data.isNavigating) {
      wx.showModal({
        title: '保存提醒',
        content: '您有未保存的更改，是否要保存？',
        confirmText: '保存',
        cancelText: '放弃',
        success: (res) => {
          if (res.confirm) {
            // 用户选择保存
            this.confirmSave()
          } else {
            // 用户选择放弃
            this.discardChanges()
          }
        }
      })
    }
  },

  // 切换编辑模式（仅用于成员介绍）
  toggleEditMode() {
    console.log('=== 开始切换编辑模式 ===')
    console.log('当前管理员状态:', this.data.isAdmin)
    console.log('当前编辑模式:', this.data.isEditMode)
    
    if (this.data.isAdmin) {
      console.log('已经是管理员，切换编辑模式')
      this.setData({
        isEditMode: !this.data.isEditMode
      })
    } else {
      console.log('不是管理员，显示密码验证弹窗')
      this.setData({
        showPasswordModal: true
      }, () => {
        console.log('密码验证弹窗状态已更新:', this.data.showPasswordModal)
        console.log('当前页面数据:', this.data)
      })
    }
  },

  // 保存成员信息（与服务器同步）
  async saveDepartmentInfo() {
    wx.showLoading({
      title: '保存中...'
    })

    try {
      // 保存到本地存储
      wx.setStorageSync('departmentMembers', this.data.members)
      
      // 保存到服务器
      const success = await app.saveDepartmentToServer(this.data.members)
      
      if (success) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '本地保存成功，服务器同步失败',
          icon: 'none'
        })
      }
      
      this.setData({
        isEditMode: false,
        hasUnsavedChanges: false
      })
    } catch (error) {
      console.error('保存失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 添加新成员卡片
  addMemberCard() {
    const newMember = {
      photo: '',
      name: '新成员',
      description: '成员简介'
    }
    
    this.setData({
      members: [...this.data.members, newMember],
      hasUnsavedChanges: true
    }, () => {
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
    })
  },

  // 删除成员卡片
  removeMemberCard(e) {
    const { index } = e.currentTarget.dataset
    const globalIndex = index
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个成员吗？',
      success: (res) => {
        if (res.confirm) {
          const newMembers = [...this.data.members]
          newMembers.splice(globalIndex, 1)
          
          this.setData({
            members: newMembers,
            hasUnsavedChanges: true
          }, () => {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
          })
        }
      }
    })
  },

  // ===== 成员介绍相关方法 =====
  // 更新成员姓名
  updateMemberName(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`members[${index}].name`]: value,
      hasUnsavedChanges: true
    })
  },

  // 更新成员简介
  updateMemberDescription(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`members[${index}].description`]: value,
      hasUnsavedChanges: true
    })
  },

  // 选择成员照片
  selectMemberPhoto(e) {
    const { index } = e.currentTarget.dataset
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        console.log('选择成员照片成功，临时路径:', tempFilePath)
        
        // 显示上传进度
        wx.showLoading({
          title: '上传中...',
          mask: true
        })
        
        // 上传到服务器
        wx.uploadFile({
          url: 'http://192.168.110.33:5000/api/upload/image',
          filePath: tempFilePath,
          name: 'image',
          header: {
            'content-type': 'multipart/form-data'
          },
          success: (uploadRes) => {
            wx.hideLoading()
            console.log('上传响应:', uploadRes)
            
            try {
              const data = JSON.parse(uploadRes.data)
              console.log('解析后的数据:', data)
              
              if (data.status === 'success') {
                // 拼接完整图片URL
                const imageUrl = 'http://192.168.110.33:5000' + data.data.url
                console.log('成员照片URL:', imageUrl)
                
                this.setData({
                  [`members[${index}].photo`]: imageUrl,
                  hasUnsavedChanges: true
                })
                
                wx.showToast({
                  title: '照片上传成功',
                  icon: 'success'
                })
              } else {
                console.error('服务器返回错误:', data)
                wx.showToast({
                  title: data.message || '上传失败',
                  icon: 'error'
                })
              }
            } catch (err) {
              console.error('解析响应失败:', err, uploadRes.data)
              wx.showToast({
                title: '解析失败',
                icon: 'error'
              })
            }
          },
          fail: (err) => {
            wx.hideLoading()
            console.error('上传失败:', err)
            
            // 详细的错误提示
            let errorMsg = '上传失败'
            if (err.errMsg) {
              if (err.errMsg.includes('url not in domain list')) {
                errorMsg = '域名未配置，请检查开发工具设置'
              } else if (err.errMsg.includes('timeout')) {
                errorMsg = '网络超时，请检查网络连接'
              } else if (err.errMsg.includes('fail')) {
                errorMsg = '网络连接失败，请检查服务器地址'
              }
            }
            
            wx.showModal({
              title: '上传失败',
              content: `${errorMsg}\n\n错误详情: ${err.errMsg || '未知错误'}`,
              showCancel: false
            })
          }
        })
      },
      fail: (err) => {
        console.error('选择成员照片失败:', err)
        wx.showToast({
          title: '选择照片失败',
          icon: 'error'
        })
      }
    })
  },

  // ===== 密码验证相关方法 =====
  // 输入密码
  inputPassword(e) {
    this.setData({
      currentPassword: e.detail.value
    })
  },

  // 验证密码（与服务器同步）
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
          isEditMode: true,
          currentPassword: ''
        })
        wx.showToast({
          title: '验证成功',
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

  // 保存提醒相关方法
  confirmSave() {
    this.saveDepartmentInfo()
    this.setData({
      showSaveReminderModal: false,
      isNavigating: true
    })
    // 允许页面跳转
    setTimeout(() => {
      this.setData({
        isNavigating: false
      })
    }, 100)
  },

  discardChanges() {
    // 重新加载原始数据
    const savedMembers = wx.getStorageSync('departmentMembers')
    if (savedMembers) {
      this.setData({
        members: savedMembers,
        hasUnsavedChanges: false,
        showSaveReminderModal: false,
        isNavigating: true
      })
    } else {
      this.setData({
        hasUnsavedChanges: false,
        showSaveReminderModal: false,
        isNavigating: true
      })
    }
    wx.showToast({
      title: '已放弃更改',
      icon: 'none'
    })
    // 允许页面跳转
    setTimeout(() => {
      this.setData({
        isNavigating: false
      })
    }, 100)
  },

  cancelSaveReminder() {
    this.setData({
      showSaveReminderModal: false
    })
  },

}) 