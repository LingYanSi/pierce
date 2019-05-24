## 穿透机制

A -> proxy服务端 -> proxy客户端 -> 本地服务
|                                  ||
A <- proxy服务端 <- proxy客户端 <- 本地服务

本质就是服务的转发

## 目的
不同网络环境，终端与服务间的链接，方便开发调试

```
server ->

xxx.server.xxx

// 缓存信息 ip: id
let cache = {
    '172.16.24.31': {
        clientId: 'xyzzzzzz',
        clientRequest: [
            {
                id: 1234, // 用来标识请求
                request, // 用来返回结果
            }
        ],
    }
}

function req(ctx) {
    const ip = ctx.host.split('.)[0]
    const id = cache[ip]
    if (id) {
        ctx.header['my_proxy_id'] = uuid()
        // 把请求头信息转发给客户端
    }
    await reponseClient(ctx.header)
    await pipeTo(ctx.response)
}


// 长轮训mannager
function loop() {

}

function client() {
    // 长轮训
    request('/server', () => {
        // 获取到id，把本地的请求信息发送给服务端
        requestClientServer().pipe(requestServer)
    })
}
```
