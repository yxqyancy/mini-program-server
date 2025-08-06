// work-guide.js
const app = getApp()

Page({
  data: {
    workGuide: {
      workflows: [],
      notices: [],
      tools: [],
      materials: []
    },
    isEditMode: false,
    isAdmin: false,
    hasUnsavedChanges: false,
    showAuthModal: false,
    showPasswordModal: false,
    showPasswordSettingModal: false,
    showSaveReminderModal: false,
    isNavigating: false,
    adminPassword: '',
    currentPassword: ''
  },

  onLoad() {
    this.loadWorkGuide()
    this.checkGlobalAdminStatus()
    
    // 监听页面返回事件
    this.setupNavigationGuard()
  },

  onShow() {
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

  // 加载工作指南数据
  loadWorkGuide() {
    const workflows = wx.getStorageSync('workflows') || []
    const notices = wx.getStorageSync('notices') || []
    const tools = wx.getStorageSync('tools') || []
    const materials = wx.getStorageSync('materials') || []

    this.setData({
      workGuide: {
        workflows,
        notices,
        tools,
        materials
      }
    })
  },

  // 切换编辑模式
  toggleEditMode() {
    console.log('=== 工作指南 - 开始切换编辑模式 ===')
    console.log('当前管理员状态:', this.data.isAdmin)
    console.log('当前编辑模式:', this.data.isEditMode)
    console.log('当前授权弹窗状态:', this.data.showAuthModal)
    
    if (this.data.isAdmin) {
      console.log('工作指南 - 已经是管理员，切换编辑模式')
      this.setData({
        isEditMode: !this.data.isEditMode
      })
    } else {
      console.log('工作指南 - 不是管理员，显示密码验证弹窗')
      this.setData({
        showPasswordModal: true
      }, () => {
        // 在setData回调中确认状态已更新
        console.log('工作指南 - 密码验证弹窗状态已更新:', this.data.showPasswordModal)
        console.log('工作指南 - 当前页面数据:', this.data)
      })
    }
  },

  // 保存工作流程
  saveWorkflow(e) {
    const { index } = e.currentTarget.dataset
    const workflow = this.data.workGuide.workflows[index]
    
    this.setData({
      workGuide: {
        ...this.data.workGuide,
        workflows: this.data.workGuide.workflows
      },
      hasUnsavedChanges: false
    })
    
    wx.setStorageSync('workflows', this.data.workGuide.workflows)
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
  },

  // 更新工作流程标题
  updateWorkflowTitle(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`workGuide.workflows[${index}].title`]: value,
      hasUnsavedChanges: true
    })
  },

  // 更新工作流程描述
  updateWorkflowDesc(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`workGuide.workflows[${index}].description`]: value,
      hasUnsavedChanges: true
    })
  },

  // 删除工作流程
  removeWorkflow(e) {
    const { index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个工作流程吗？',
      success: (res) => {
        if (res.confirm) {
          const workflows = this.data.workGuide.workflows
          workflows.splice(index, 1)
          this.setData({
            workGuide: {
              ...this.data.workGuide,
              workflows
            }
          })
          wx.setStorageSync('workflows', workflows)
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 添加工作流程
  addWorkflow() {
    const workflows = this.data.workGuide.workflows
    workflows.push({
      title: '新工作流程',
      description: '流程描述'
    })
    this.setData({
      workGuide: {
        ...this.data.workGuide,
        workflows
      },
      hasUnsavedChanges: true
    })
  },

  // ===== 注意事项相关方法 =====
  // 保存注意事项
  saveNotice(e) {
    const { index } = e.currentTarget.dataset
    const notice = this.data.workGuide.notices[index]
    
    this.setData({
      workGuide: {
        ...this.data.workGuide,
        notices: this.data.workGuide.notices
      }
    })
    
    wx.setStorageSync('notices', this.data.workGuide.notices)
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
  },

  // 更新注意事项标题
  updateNoticeTitle(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`workGuide.notices[${index}].title`]: value,
      hasUnsavedChanges: true
    })
  },

  // 更新注意事项内容
  updateNoticeContent(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`workGuide.notices[${index}].content`]: value,
      hasUnsavedChanges: true
    })
  },

  // 删除注意事项
  removeNotice(e) {
    const { index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个注意事项吗？',
      success: (res) => {
        if (res.confirm) {
          const notices = this.data.workGuide.notices
          notices.splice(index, 1)
          this.setData({
            workGuide: {
              ...this.data.workGuide,
              notices
            }
          })
          wx.setStorageSync('notices', notices)
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 添加注意事项
  addNotice() {
    const notices = this.data.workGuide.notices
    notices.push({
      title: '新注意事项',
      content: '注意事项内容'
    })
    this.setData({
      workGuide: {
        ...this.data.workGuide,
        notices
      }
    })
    wx.setStorageSync('notices', notices)
  },

  // ===== 工具相关方法 =====
  updateToolIcon(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`workGuide.tools[${index}].icon`]: value,
      hasUnsavedChanges: true
    })
  },

  updateToolName(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`workGuide.tools[${index}].name`]: value,
      hasUnsavedChanges: true
    })
  },

  updateToolDesc(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`workGuide.tools[${index}].description`]: value,
      hasUnsavedChanges: true
    })
  },

  updateToolUrl(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`workGuide.tools[${index}].url`]: value,
      hasUnsavedChanges: true
    })
  },

  addTool() {
    const tools = this.data.workGuide.tools
    tools.push({
      icon: '🛠️',
      name: '新工具',
      description: '工具描述',
      url: '工具链接'
    })
    this.setData({
      workGuide: {
        ...this.data.workGuide,
        tools
      }
    })
    wx.setStorageSync('tools', tools)
  },

  removeTool(e) {
    const { index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个工具吗？',
      success: (res) => {
        if (res.confirm) {
          const tools = this.data.workGuide.tools
          tools.splice(index, 1)
          this.setData({
            workGuide: {
              ...this.data.workGuide,
              tools
            }
          })
          wx.setStorageSync('tools', tools)
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  openTool(e) {
    const { index } = e.currentTarget.dataset
    const tool = this.data.workGuide.tools[index]
    if (tool.url) {
      wx.navigateTo({
        url: tool.url
      })
    }
  },

  // ===== 密码验证相关方法 =====
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

    console.log('工作指南 - 开始验证密码...')
    wx.showLoading({
      title: '验证中...'
    })

    try {
      const isCorrect = await app.verifyAdminPassword(password)
      console.log('工作指南 - 密码验证结果:', isCorrect)
      
      if (isCorrect) {
        console.log('工作指南 - 密码验证成功，设置管理员状态')
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
        console.log('工作指南 - 密码验证失败')
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



  // ===== 工作材料相关方法 =====
  
  // 更新材料名称
  updateMaterialName(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`workGuide.materials[${index}].name`]: value,
      hasUnsavedChanges: true
    })
  },

  // 添加材料
  addMaterial() {
    const materials = this.data.workGuide.materials
    materials.push({
      name: '新材料',
      file: '',
      fileName: ''
    })
    this.setData({
      'workGuide.materials': materials
    })
    wx.setStorageSync('materials', materials)
  },

  // 删除材料
  removeMaterial(e) {
    const { index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个材料吗？',
      success: (res) => {
        if (res.confirm) {
          const materials = this.data.workGuide.materials
          materials.splice(index, 1)
          this.setData({
            'workGuide.materials': materials
          })
          wx.setStorageSync('materials', materials)
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 选择文件
  chooseFile(e) {
    const { section, index } = e.currentTarget.dataset
    
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].path
        const fileName = res.tempFiles[0].name
        
        console.log('选择文件成功，临时路径:', tempFilePath, '文件名:', fileName)
        
        // 显示上传进度
        wx.showLoading({
          title: '上传中...',
          mask: true
        })
        
        // 上传到服务器
        wx.uploadFile({
          url: 'http://192.168.110.33:5000/api/upload/file',
          filePath: tempFilePath,
          name: 'file',
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
                // 拼接完整文件URL
                const fileUrl = 'http://192.168.110.33:5000' + data.data.url
                console.log('文件URL:', fileUrl)
                
                this.setData({
                  [`workGuide.${section}[${index}].file`]: fileUrl,
                  [`workGuide.${section}[${index}].fileName`]: fileName
                })
                
                // 保存到本地存储
                wx.setStorageSync(section, this.data.workGuide[section])
                
                wx.showToast({
                  title: '文件上传成功',
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
        console.error('选择文件失败:', err)
        wx.showToast({
          title: '选择文件失败',
          icon: 'error'
        })
      }
    })
  },

  // 删除文件
  removeFile(e) {
    const { section, index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个文件吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            [`workGuide.${section}[${index}].file`]: '',
            [`workGuide.${section}[${index}].fileName`]: ''
          })
          
          // 保存到本地存储
          wx.setStorageSync(section, this.data.workGuide[section])
          
          wx.showToast({
            title: '文件已删除',
            icon: 'success'
          })
        }
      }
    })
  },

  // 打开材料文件
  openMaterial(e) {
    const { index } = e.currentTarget.dataset
    const material = this.data.workGuide.materials[index]
    
    if (material.file) {
      wx.openDocument({
        filePath: material.file,
        success: (res) => {
          console.log('文件打开成功')
        },
        fail: (err) => {
          console.error('文件打开失败:', err)
          wx.showToast({
            title: '文件打开失败',
            icon: 'error'
          })
        }
      })
    } else {
      wx.showToast({
        title: '暂无文件',
        icon: 'none'
      })
    }
  },

  // 保存提醒相关方法
  confirmSave() {
    // 保存所有数据
    wx.setStorageSync('workflows', this.data.workGuide.workflows)
    wx.setStorageSync('notices', this.data.workGuide.notices)
    wx.setStorageSync('tools', this.data.workGuide.tools)
    wx.setStorageSync('materials', this.data.workGuide.materials)
    
    this.setData({
      hasUnsavedChanges: false,
      showSaveReminderModal: false,
      isNavigating: true
    })
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
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
    this.loadWorkGuide()
    this.setData({
      hasUnsavedChanges: false,
      showSaveReminderModal: false,
      isNavigating: true
    })
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