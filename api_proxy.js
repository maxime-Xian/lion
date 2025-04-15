const http = require('http');
const url = require('url');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 处理API代理请求
  if (req.method === 'POST' && pathname === '/api/proxy') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { requestBody } = JSON.parse(body);
        const apiKey = process.env.DEEPSEEK_API_KEY;
        
        if (!apiKey) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '缺少API密钥配置' }));
          return;
        }
        
        if (!requestBody) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '请提供请求体' }));
          return;
        }
        
        // 构建API请求选项
        const apiRequestOptions = {
          hostname: 'ark.cn-beijing.volces.com',
          path: '/api/v3/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        };
        
        // 构建请求体
        const apiRequestBody = JSON.stringify(requestBody);
        
        // 发送请求到DeepSeek API
        const apiReq = http.request(apiRequestOptions, apiRes => {
          let apiResponseData = '';
          
          apiRes.on('data', chunk => {
            apiResponseData += chunk;
          });
          
          apiRes.on('end', () => {
            // 设置响应头，允许跨域
            res.writeHead(apiRes.statusCode, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type'
            });
            
            // 将API响应转发给客户端
            res.end(apiResponseData);
          });
        });
        
        apiReq.on('error', error => {
          console.error('API请求错误:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'API请求失败' }));
        });
        
        // 设置请求超时
        apiReq.setTimeout(60000, () => {
          apiReq.abort();
          res.writeHead(504, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'API请求超时' }));
        });
        
        // 发送请求体
        apiReq.write(apiRequestBody);
        apiReq.end();
        
      } catch (error) {
        console.error('处理请求时出错:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '无效的请求数据' }));
      }
    });
    return;
  }
  
  // 处理OPTIONS请求（预检请求）
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400' // 24小时
    });
    res.end();
    return;
  }

  // 处理未知请求
  res.writeHead(404);
  res.end('404 Not Found');
});

// 设置服务器端口
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`API代理服务器运行在 http://localhost:${PORT}`);
});