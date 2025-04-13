#!/bin/bash

# 正确格式的DeepSeek API调用示例
curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 4d741fcd-733b-454f-bc06-7326e3d824ec" \
  -d '{ 
    "model": "deepseek-r1-250120",
    "messages": [
        {
            "role": "user",
            "content": "我要有研究推理模型与非推理模型区别的课题，怎么体现我的专业性"
        }
    ]
}'