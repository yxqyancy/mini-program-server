// pages/cloud-test/cloud-test.js
Page({
  data: {
    uploadedImage: '',
    uploadedFile: '',
    testResults: []
  },

  onLoad() {
    this.testServerConnection()
  },

  // 测试服务器连接
  testServerConnection() {
    wx.request({
      url: 'http://192.168.110.33:5000/api/health',
      method: 'GET',
      success: (res) => {
        console.log('服务器连接测试成功:', res.data)
        this.addTestResult('服务器连接', '✅ 成功', res.data)
      },
      fail: (err) => {
        console.error('服务器连接测试失败:', err)
        this.addTestResult('服务器连接', '❌ 失败', err.errMsg)
      }
    })
  },

  // 测试图片上传
  testImageUpload() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        console.log('选择测试图片:', tempFilePath)
        
        wx.showLoading({
          title: '测试上传中...',
          mask: true
        })
        
        wx.uploadFile({
          url: 'http://192.168.110.33:5000/api/upload/image',
          filePath: tempFilePath,
          name: 'image',
          header: {
            'content-type': 'multipart/form-data'
          },
          success: (uploadRes) => {
            wx.hideLoading()
            console.log('图片上传测试响应:', uploadRes)
            
            try {
              const data = JSON.parse(uploadRes.data)
              if (data.status === 'success') {
                const imageUrl = 'http://192.168.110.33:5000' + data.data.url
                this.setData({
                  uploadedImage: imageUrl
                })
                this.addTestResult('图片上传', '✅ 成功', `URL: ${imageUrl}`)
              } else {
                this.addTestResult('图片上传', '❌ 失败', data.message)
              }
            } catch (err) {
              this.addTestResult('图片上传', '❌ 解析失败', err.message)
            }
          },
          fail: (err) => {
            wx.hideLoading()
            console.error('图片上传测试失败:', err)
            this.addTestResult('图片上传', '❌ 失败', err.errMsg)
          }
        })
      },
      fail: (err) => {
        this.addTestResult('图片选择', '❌ 失败', err.errMsg)
      }
    })
  },

  // 测试文件上传
  testFileUpload() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].path
        const fileName = res.tempFiles[0].name
        console.log('选择测试文件:', tempFilePath, fileName)
        
        wx.showLoading({
          title: '测试上传中...',
          mask: true
        })
        
        wx.uploadFile({
          url: 'http://192.168.110.33:5000/api/upload/file',
          filePath: tempFilePath,
          name: 'file',
          header: {
            'content-type': 'multipart/form-data'
          },
          success: (uploadRes) => {
            wx.hideLoading()
            console.log('文件上传测试响应:', uploadRes)
            
            try {
              const data = JSON.parse(uploadRes.data)
              if (data.status === 'success') {
                const fileUrl = 'http://192.168.110.33:5000' + data.data.url
                this.setData({
                  uploadedFile: fileUrl
                })
                this.addTestResult('文件上传', '✅ 成功', `URL: ${fileUrl}`)
              } else {
                this.addTestResult('文件上传', '❌ 失败', data.message)
              }
            } catch (err) {
              this.addTestResult('文件上传', '❌ 解析失败', err.message)
            }
          },
          fail: (err) => {
            wx.hideLoading()
            console.error('文件上传测试失败:', err)
            this.addTestResult('文件上传', '❌ 失败', err.errMsg)
          }
        })
      },
      fail: (err) => {
        this.addTestResult('文件选择', '❌ 失败', err.errMsg)
      }
    })
  },

  // 添加测试结果
  addTestResult(testName, status, message) {
    const testResults = this.data.testResults
    testResults.push({
      name: testName,
      status: status,
      message: message,
      time: new Date().toLocaleTimeString()
    })
    this.setData({
      testResults: testResults
    })
  },

  // 清空测试结果
  clearTestResults() {
    this.setData({
      testResults: [],
      uploadedImage: '',
      uploadedFile: ''
    })
  },

  // 预览图片
  previewImage() {
    if (this.data.uploadedImage) {
      wx.previewImage({
        current: this.data.uploadedImage,
        urls: [this.data.uploadedImage]
      })
    }
  },

  // 下载文件
  downloadFile() {
    if (this.data.uploadedFile) {
      wx.downloadFile({
        url: this.data.uploadedFile,
        success: (res) => {
          wx.openDocument({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({
                title: '文件打开成功',
                icon: 'success'
              })
            },
            fail: (err) => {
              wx.showToast({
                title: '文件打开失败',
                icon: 'error'
              })
            }
          })
        },
        fail: (err) => {
          wx.showToast({
            title: '文件下载失败',
            icon: 'error'
          })
        }
      })
    }
  }
}) 