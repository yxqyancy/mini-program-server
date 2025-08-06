const app = getApp()

Page({
  data: {
    lifeGuide: {
      foods: [],
      teamBuildings: [],
      moneys: [],
      maps: []
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
    this.loadLifeGuide()
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

  // 加载生活指南数据
  loadLifeGuide() {
    const lifeGuide = wx.getStorageSync('lifeGuide')
    if (lifeGuide) {
      this.setData({
        lifeGuide: lifeGuide
      })
    }
  },

  // 切换编辑模式
  toggleEditMode() {
    console.log('=== 生活指南 - 开始切换编辑模式 ===')
    console.log('当前管理员状态:', this.data.isAdmin)
    console.log('当前编辑模式:', this.data.isEditMode)
    console.log('当前授权弹窗状态:', this.data.showAuthModal)
    
    if (this.data.isAdmin) {
      console.log('生活指南 - 已经是管理员，切换编辑模式')
      this.setData({
        isEditMode: !this.data.isEditMode
      })
    } else {
      console.log('生活指南 - 不是管理员，显示密码验证弹窗')
      this.setData({
        showPasswordModal: true
      }, () => {
        // 在setData回调中确认状态已更新
        console.log('生活指南 - 密码验证弹窗状态已更新:', this.data.showPasswordModal)
        console.log('生活指南 - 当前页面数据:', this.data)
      })
    }
  },

  // 保存生活指南
  saveLifeGuide() {
    wx.setStorageSync('lifeGuide', this.data.lifeGuide)
    this.setData({
      hasUnsavedChanges: false
    })
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
  },

  // ===== 图片处理方法 =====
  chooseImage(e) {
    const { section, index } = e.currentTarget.dataset
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        console.log('选择图片成功，临时路径:', tempFilePath)
        
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
                console.log('图片URL:', imageUrl)
                
                this.setData({
                  [`lifeGuide.${section}[${index}].image`]: imageUrl
                })
                
                wx.showToast({
                  title: '图片上传成功',
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
        console.error('选择图片失败:', err)
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        })
      }
    })
  },

  removeImage(e) {
    const { section, index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            [`lifeGuide.${section}[${index}].image`]: ''
          })
          wx.showToast({
            title: '图片已删除',
            icon: 'success'
          })
        }
      }
    })
  },

  previewImage(e) {
    const { src } = e.currentTarget.dataset
    wx.previewImage({
      current: src,
      urls: [src]
    })
  },

  // ===== 美食相关方法 =====
  updateFoodName(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`lifeGuide.foods[${index}].name`]: value
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  updateFoodLocation(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`lifeGuide.foods[${index}].location`]: value
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  updateFoodPrice(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`lifeGuide.foods[${index}].price`]: value
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  addFood() {
    const foods = this.data.lifeGuide.foods
    foods.push({
      name: '新美食',
      location: '位置',
      price: '价格',
      image: ''
    })
    this.setData({
      'lifeGuide.foods': foods
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  removeFood(e) {
    const { index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个美食吗？',
      success: (res) => {
        if (res.confirm) {
          const foods = this.data.lifeGuide.foods
          foods.splice(index, 1)
          this.setData({
            'lifeGuide.foods': foods
          }, () => {
            // 自动保存数据
            this.saveLifeGuide()
          })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // ===== 团建相关方法 =====
  updateTeamBuildingName(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`lifeGuide.teamBuildings[${index}].name`]: value
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  updateTeamBuildingDesc(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`lifeGuide.teamBuildings[${index}].description`]: value
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  updateTeamBuildingTime(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`lifeGuide.teamBuildings[${index}].time`]: value
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  updateTeamBuildingLocation(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`lifeGuide.teamBuildings[${index}].location`]: value
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  addTeamBuilding() {
    const teamBuildings = this.data.lifeGuide.teamBuildings
    teamBuildings.push({
      name: '新团建活动',
      description: '团建描述',
      time: '时间',
      location: '地点',
      image: ''
    })
    this.setData({
      'lifeGuide.teamBuildings': teamBuildings
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  removeTeamBuilding(e) {
    const { index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个团建活动吗？',
      success: (res) => {
        if (res.confirm) {
          const teamBuildings = this.data.lifeGuide.teamBuildings
          teamBuildings.splice(index, 1)
          this.setData({
            'lifeGuide.teamBuildings': teamBuildings
          }, () => {
            // 自动保存数据
            this.saveLifeGuide()
          })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // ===== 赚钱相关方法 =====
  updateMoneyName(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`lifeGuide.moneys[${index}].name`]: value
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  updateMoneyDesc(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`lifeGuide.moneys[${index}].description`]: value
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  updateMoneySalary(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`lifeGuide.moneys[${index}].salary`]: value
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  addMoney() {
    const moneys = this.data.lifeGuide.moneys
    moneys.push({
      name: '新工作',
      description: '工作描述',
      salary: '薪资',
      image: ''
    })
    this.setData({
      'lifeGuide.moneys': moneys
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  removeMoney(e) {
    const { index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个工作吗？',
      success: (res) => {
        if (res.confirm) {
          const moneys = this.data.lifeGuide.moneys
          moneys.splice(index, 1)
          this.setData({
            'lifeGuide.moneys': moneys
          }, () => {
            // 自动保存数据
            this.saveLifeGuide()
          })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // ===== 校园地图相关方法 =====
  updateMapName(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`lifeGuide.maps[${index}].name`]: value
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  addMap() {
    const maps = this.data.lifeGuide.maps
    maps.push({
      name: '新地图',
      image: ''
    })
    this.setData({
      'lifeGuide.maps': maps
    }, () => {
      // 自动保存数据
      this.saveLifeGuide()
    })
  },

  removeMap(e) {
    const { index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地图吗？',
      success: (res) => {
        if (res.confirm) {
          const maps = this.data.lifeGuide.maps
          maps.splice(index, 1)
          this.setData({
            'lifeGuide.maps': maps
          }, () => {
            // 自动保存数据
            this.saveLifeGuide()
          })
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
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

    console.log('生活指南 - 开始验证密码...')
    wx.showLoading({
      title: '验证中...'
    })

    try {
      const isCorrect = await app.verifyAdminPassword(password)
      console.log('生活指南 - 密码验证结果:', isCorrect)
      
      if (isCorrect) {
        console.log('生活指南 - 密码验证成功，设置管理员状态')
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
        console.log('生活指南 - 密码验证失败')
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
    this.saveLifeGuide()
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
    this.loadLifeGuide()
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