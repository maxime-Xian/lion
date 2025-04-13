const http = require('http');

// API密钥
const API_KEY = process.env.DEEPSEEK_API_KEY;

// 构建API请求选项
const apiRequestOptions = {
  hostname: 'ark.cn-beijing.volces.com',
  path: '/api/v3/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
};

// 构建请求体 - 修复了JSON格式问题
const apiRequestBody = JSON.stringify({
  model: 'deepseek-r1-250120',
  messages: [
    {
      role: 'user',
      content: '我要有研究推理模型与非推理模型区别的课题，怎么体现我的专业性'
    }
  ]
});

console.log('发送请求到DeepSeek API...');
console.log('请求体:', apiRequestBody);

// 发送请求到DeepSeek API
const apiReq = http.request(apiRequestOptions, apiRes => {
  let apiResponseData = '';
  
  apiRes.on('data', chunk => {
    apiResponseData += chunk;
  });
  
  apiRes.on('end', () => {
    console.log('API响应状态码:', apiRes.statusCode);
    console.log('API响应头:', apiRes.headers);
    
    try {
      // 尝试解析JSON响应
      const responseObj = JSON.parse(apiResponseData);
      console.log('API响应(已格式化):', JSON.stringify(responseObj, null, 2));
    } catch (e) {
      // 如果不是有效的JSON，则输出原始响应
      console.log('API原始响应:', apiResponseData);
    }
  });
});

apiReq.on('error', error => {
  console.error('API请求错误:', error);
});

// 设置请求超时
apiReq.setTimeout(60000, () => {
  apiReq.abort();
  console.error('API请求超时');
});

// 发送请求体
apiReq.write(apiRequestBody);
apiReq.end();

console.log('请求已发送，等待响应...');