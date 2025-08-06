// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { type, data } = event
  
  console.log('云函数调用:', type, data)
  
  try {
    switch (type) {
      case 'get_department':
        return await getDepartment()
      case 'save_department':
        return await saveDepartment(data)
      case 'get_life_guide':
        return await getLifeGuide()
      case 'save_life_guide':
        return await saveLifeGuide(data)
      case 'get_work_guide':
        return await getWorkGuide()
      case 'save_work_guide':
        return await saveWorkGuide(data)
      case 'get_admin':
        return await getAdmin()
      case 'save_admin':
        return await saveAdmin(data)
      case 'verify_admin':
        return await verifyAdmin(data)
      default:
        return { status: 'error', message: '未知操作类型' }
    }
  } catch (error) {
    console.error('云函数执行错误:', error)
    return { status: 'error', message: error.message }
  }
}

// 获取部门信息
async function getDepartment() {
  try {
    const result = await db.collection('department').doc('main').get()
    return {
      status: 'success',
      data: result.data.members || []
    }
  } catch (error) {
    // 如果文档不存在，返回空数组
    if (error.errCode === -1) {
      return {
        status: 'success',
        data: []
      }
    }
    throw error
  }
}

// 保存部门信息
async function saveDepartment(data) {
  try {
    await db.collection('department').doc('main').set({
      data: {
        members: data.members || [],
        updateTime: new Date()
      }
    })
    return {
      status: 'success',
      message: '部门信息保存成功'
    }
  } catch (error) {
    throw error
  }
}

// 获取生活指南
async function getLifeGuide() {
  try {
    const result = await db.collection('life_guide').doc('main').get()
    return {
      status: 'success',
      data: result.data || {}
    }
  } catch (error) {
    if (error.errCode === -1) {
      return {
        status: 'success',
        data: {}
      }
    }
    throw error
  }
}

// 保存生活指南
async function saveLifeGuide(data) {
  try {
    await db.collection('life_guide').doc('main').set({
      data: {
        ...data,
        updateTime: new Date()
      }
    })
    return {
      status: 'success',
      message: '生活指南保存成功'
    }
  } catch (error) {
    throw error
  }
}

// 获取工作指南
async function getWorkGuide() {
  try {
    const result = await db.collection('work_guide').doc('main').get()
    return {
      status: 'success',
      data: result.data || {}
    }
  } catch (error) {
    if (error.errCode === -1) {
      return {
        status: 'success',
        data: {}
      }
    }
    throw error
  }
}

// 保存工作指南
async function saveWorkGuide(data) {
  try {
    await db.collection('work_guide').doc('main').set({
      data: {
        ...data,
        updateTime: new Date()
      }
    })
    return {
      status: 'success',
      message: '工作指南保存成功'
    }
  } catch (error) {
    throw error
  }
}

// 获取管理员信息
async function getAdmin() {
  try {
    const result = await db.collection('admin').doc('main').get()
    return {
      status: 'success',
      data: result.data || {}
    }
  } catch (error) {
    if (error.errCode === -1) {
      return {
        status: 'success',
        data: {}
      }
    }
    throw error
  }
}

// 保存管理员信息
async function saveAdmin(data) {
  try {
    await db.collection('admin').doc('main').set({
      data: {
        ...data,
        updateTime: new Date()
      }
    })
    return {
      status: 'success',
      message: '管理员信息保存成功'
    }
  } catch (error) {
    throw error
  }
}

// 验证管理员密码
async function verifyAdmin(data) {
  try {
    const result = await db.collection('admin').doc('main').get()
    const storedPassword = result.data.password || ''
    const inputPassword = data.password || ''
    
    if (inputPassword === storedPassword) {
      return {
        status: 'success',
        message: '密码验证成功',
        is_admin: true
      }
    } else {
      return {
        status: 'error',
        message: '密码错误',
        is_admin: false
      }
    }
  } catch (error) {
    if (error.errCode === -1) {
      // 如果管理员文档不存在，使用默认密码
      const defaultPassword = 'admin123'
      const inputPassword = data.password || ''
      
      if (inputPassword === defaultPassword) {
        return {
          status: 'success',
          message: '密码验证成功',
          is_admin: true
        }
      } else {
        return {
          status: 'error',
          message: '密码错误',
          is_admin: false
        }
      }
    }
    throw error
  }
} 