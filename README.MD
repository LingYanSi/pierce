## 穿透机制

A -> proxy服务端 -> proxy客户端 -> 本地服务
|                                  ||
A <- proxy服务端 <- proxy客户端 <- 本地服务

本质就是服务的转发

## 目的
不同网络环境，终端与服务间的链接，方便开发调试

## 使用
### 请求
```
https://your.com/api/proxy/clientId/YOUR_ID/http://any.com/xx/xxxx.js
```
### 客户端启动
```
node src/client/index.js host=your.com id=123 port=8000
```
- host: 代理服务域名
- id: 服务端注册id
- port: 本地端口
