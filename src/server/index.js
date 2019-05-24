const Koa = require('koa');
const app = new Koa();

// proxy客户端长轮训，等待请求到来
class Holders {
    constructor() {
        this.cache = {}
    }
    set(id, ctx) {
        console.log(`|proxy client connect| id:${id}`)
        this.cache[id] = this.cache[id] || []
        this.cache[id].push(ctx)
    }
    get(id) {
        if (!this.cache[id]) return null
        const holder = this.cache[id].pop()
        return holder
    }
}

// 事件订阅派发
class Pub {
    constructor() {
        this.cache = {}
    }
    on(id, callback) {
        this.cache[id] = callback
    }
    trigger(id, ...args) {
        const callback = this.cache[id]
        delete this.cache[id]
        callback && callback(...args)
    }
}

const holders = new Holders()
const pub = new Pub()

function waitCtxContinue(callback, ctx) {
    return new Promise(res => {
        ctx._endRequest = (...args) => {
            res()
            callback && callback(...args)
        }
    })
}

function continueCtx(ctx, ...args) {
    ctx._endRequest && ctx._endRequest(...args)
}

function uuid(length = 16) {
    const STR = '1234567890_qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
    return Array.from({ length }).map(i => {
        return STR[Math.floor(Math.random() * STR.length)]
    }).join('')
}

// 只实现简单的get请求转发
// response
app.use(async (ctx) => {
    if (ctx.path == '/api/pierce') {
        const { url, clientId } = ctx.request.query
        const holder = holders.get(clientId)

        if (holder) {
            // 请求转发给client
            const id = uuid()
            continueCtx(holder, {
                // headers: ctx.request.header,
                url,
                id,
            })

            // 等到收到client发送过来的响应
            pub.on(id, (newPipe, header) => {
                continueCtx(ctx)
                Object.keys(header).forEach(key => {
                    ctx.set(key, header[key])
                })
                console.log('data to requester')
                ctx.body = newPipe
            })

            // 响应请求
            await waitCtxContinue(() => {}, ctx)
        } else {
            const msg = 'NO CLIENT CONNECT'
            console.log(msg)
            ctx.body = msg
        }
    } else if (ctx.path == '/api/pierce/receive') {
        const { id } = ctx.request.query
        pub.trigger(id, ctx.req, ctx.request.header)
        console.log(`proxy client send data: ${id}`)

        ctx.req.on('close', () => {
            continueCtx(ctx)
        })

        await waitCtxContinue(() => {
            ctx.body = 'continue'
        }, ctx)

    } else if (ctx.path == '/api/pierce/holder') {
        const { id } = ctx.request.query
        holders.set(id, ctx)

        await waitCtxContinue((info) => {
            ctx.body = JSON.stringify(info);
        }, ctx)
    }
});

app.listen(8965, () => {
    console.log('http://localhost:8965')
});
