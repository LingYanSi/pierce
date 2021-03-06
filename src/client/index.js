const request = require('request')

const { host, port, id } = (() => {
    const config = {}
    process.argv.slice(2).forEach(item => {
        const [key, value] = item.split('=')
        config[key] = value
    })
    console.log(config)
    return config
})()

const HOST = 'http://' + host

function fakeServer() {
    // 请求响应后立即再次请求
    request.get(`${HOST}/api/pierce/holder?id=${id}`, { timeout: 10000 }, (err, response, body) => {
        if (err) {
            if (!err.message.match(/timedout/i)) {
                console.log('proxy server error', err)
                console.log('your can restart the proxy client')
                setTimeout(fakeServer, 3000)
                return
            }
        } else {
            let data = {}
            try {
                data = JSON.parse(body)
            } catch (err) {
                console.log('data parse error', body)
            }

            let { url, id, headers } = data;
            if (url && id) {
                // replace hostname
                url = url.replace(/https?:\/{2}([^?./#]+\.)+[^?./#]+/, ['http://127.0.0.1', port].join(':'))
                console.log('--> proxy server request', url)
                request(url)
                   .pipe(
                       request.post(`${HOST}/api/pierce/receive?id=${id}`, () => {
                           console.log('数据已上传到proxy服务器 <--')
                       })
                   )
            }
        }
        fakeServer()
    });
}

fakeServer()
