// 部署配置文件
const config = {
  // 开发环境
  development: {
    serverUrl: 'http://localhost:5000',
    uploadUrl: 'http://localhost:5000/api/upload'
  },
  
  // 测试环境
  staging: {
    serverUrl: 'https://your-test-domain.com',
    uploadUrl: 'https://your-test-domain.com/api/upload'
  },
  
  // 生产环境
  production: {
    serverUrl: 'https://your-production-domain.com',
    uploadUrl: 'https://your-production-domain.com/api/upload'
  }
}

// 根据环境选择配置
const getConfig = (env = 'development') => {
  return config[env] || config.development
}

module.exports = {
  config,
  getConfig
} 