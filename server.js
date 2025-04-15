const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 处理静态文件请求
  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    // 重定向到中文名生成器页面
    res.writeHead(302, { 'Location': '/chinese_name_generator.html' });
    res.end();
    return;
  }

  // 处理静态文件请求
  if (req.method === 'GET' && !pathname.startsWith('/api/')) {
    const filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    const extname = path.extname(filePath);
    
    // 设置Content-Type
    const contentTypeMap = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };
    
    const contentType = contentTypeMap[extname] || 'text/plain';
    
    // 读取文件
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // 文件不存在
          res.writeHead(404);
          res.end('404 Not Found');
        } else {
          // 服务器错误
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        // 成功响应
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
    return;
  }

  // 处理中文名生成API请求
  if (req.method === 'POST' && pathname === '/api/generate-names') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { englishName } = JSON.parse(body);
        const apiKey = process.env.DEEPSEEK_API_KEY;
        
        if (!englishName) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '请提供英文名' }));
          return;
        }
        
        if (!apiKey) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '缺少API密钥配置' }));
          return;
        }
        
        // 构建提示词
        const systemPrompt = `你是一位精通中西方文化的专家，擅长为外国人起富有中国特色的名字。请根据提供的英文名，生成三个有趣、有文化内涵的中文名。

每个名字需要：
1. 体现中国传统文化或现代文化元素
2. 考虑英文名的含义和音译
3. 包含一些幽默或有趣的元素
4. 提供详细的中英文解释，说明名字的寓意和文化背景

请严格按以下格式输出三个名字，确保每个部分都有内容：

名字1：[中文名] ([拼音])
中文解释：[详细解释名字的含义、文化背景和幽默元素]
英文解释：[英文版的解释，便于外国人理解]

名字2：[中文名] ([拼音])
中文解释：[详细解释名字的含义、文化背景和幽默元素]
英文解释：[英文版的解释，便于外国人理解]

名字3：[中文名] ([拼音])
中文解释：[详细解释名字的含义、文化背景和幽默元素]
英文解释：[英文版的解释，便于外国人理解]

请确保每个名字都有中文解释和英文解释，并且格式一致。不要省略任何部分。`;
        
        const userPrompt = `请为英文名"${englishName}"生成三个有趣、有文化内涵的中文名。`;
        
        // 构建API请求选项
        const apiRequestOptions = {
          hostname: 'api.deepseek.com',
          path: '/v1/chat/completions',
          port: 443,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        };
        
        // 使用https模块而不是http
        const https = require('https');
        
        // 构建请求体
        const apiRequestBody = JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        });
        
        console.log('发送请求到DeepSeek API...');
        console.log('请求选项:', JSON.stringify(apiRequestOptions));
        console.log('请求体:', apiRequestBody);
        
        // 发送请求到DeepSeek API
        const apiReq = https.request(apiRequestOptions, apiRes => {
          let apiResponseData = '';
          
          console.log('收到API响应头:', apiRes.statusCode, apiRes.headers);
          
          apiRes.on('data', chunk => {
            apiResponseData += chunk;
            console.log('收到API响应数据片段');
          });
          
          apiRes.on('end', () => {
            console.log('API响应完成，状态码:', apiRes.statusCode);
            console.log('API响应数据:', apiResponseData.substring(0, 200) + '...');
            
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

  // 处理Life Coach API请求
  if (req.method === 'POST' && pathname === '/api/life-coach') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { message } = JSON.parse(body);
        
        if (!message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '请提供消息内容' }));
          return;
        }
        
        // 构建提示词
        const systemPrompt = `你是一位专业的个人成长顾问（Life Coach），你的目标是通过对话帮助用户成长和进步。

作为一名优秀的Life Coach，你应该：
1. 倾听用户的问题和困惑，理解他们的需求
2. 提供有建设性的建议和指导，帮助用户制定目标和计划
3. 鼓励用户培养良好的习惯和积极的思维方式
4. 帮助用户发现自身的潜力和优势
5. 在用户遇到挫折时提供情感支持和动力
6. 提供实用的工具和方法，帮助用户解决具体问题
7. 保持专业、积极、支持性的沟通风格

请记住，你的目标是帮助用户成为更好的自己，而不是替他们做决定。你应该引导他们进行自我反思，发现自己的答案。`;
        
        // 构建API请求选项
        const apiRequestOptions = {
          hostname: 'ark.cn-beijing.volces.com',
          path: '/api/v3/chat/completions',
          port: 443,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
          }
        };
        
        // 构建请求体
        const apiRequestBody = JSON.stringify({
          model: 'deepseek-r1-250120',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.6,
          stream: false
        });
        
        console.log('发送请求到DeepSeek R1 API...');
        
        // 发送请求到DeepSeek API
        const apiReq = https.request(apiRequestOptions, apiRes => {
          let apiResponseData = '';
          
          apiRes.on('data', chunk => {
            apiResponseData += chunk;
          });
          
          apiRes.on('end', () => {
            console.log('API响应完成，状态码:', apiRes.statusCode);
            
            try {
              const responseObj = JSON.parse(apiResponseData);
              
              // 设置响应头，允许跨域
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
              });
              
              // 提取AI回复内容
              const aiResponse = responseObj.choices[0].message.content;
              
              // 返回处理后的响应
              res.end(JSON.stringify({ response: aiResponse }));
            } catch (error) {
              console.error('解析API响应时出错:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'API响应解析失败' }));
            }
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
  
  // 处理未知请求
  res.writeHead(404);
  res.end('404 Not Found');
});

// 设置服务器端口
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('可用页面:');
  console.log('- 中文名生成器: http://localhost:' + PORT + '/chinese_name_generator.html');
  console.log('- 个人成长顾问: http://localhost:' + PORT + '/life_coach.html');
});