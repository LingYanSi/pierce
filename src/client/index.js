const request = require('request')

const { ip: IP, port: PORT, subDomain } = (() => {
    const config = {}
    process.argv.slice(2).forEach(item => {
        const [key, value] = item.split('=')
        config[key] = value
    })
    return config
})

const HOST = 'http://' + [IP, PORT].filter(i => i).join(':')

function fakeServer() {
    // 请求响应后立即再次请求
    request.get(`${HOST}/api/pierce/holder?id=${subDomain}`, (err, response, body) => {
        if (err) {
            console.log('proxy server error', err)
            console.log('your can restart the proxy client')
            return
        }
        let data = {}
        try {
            data = JSON.parse(body)
        } catch (err) {
            console.log('data parse error')
        }

        const { url, id, headers } = data;
        if (url && id) {
            request(url)
               .pipe(
                   request.post(`${HOST}/api/pierce/receive?id=${id}`, () => {
                       console.log('数据已上传到proxy服务器')
                   })
               )
        }
        fakeServer()
    });
}

fakeServer()
