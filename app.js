//NodeMediaServer V3 转发任务快速导入工具
//Chen Mingliang 2021-09-18
//https://www.nodemedia.cn/product/node-media-server

const md5 = require('md5');
const request = require('request');
const xlsx = require('node-xlsx').default;
// parse方法的参数为要解析的excel的路径
const list = xlsx.parse('./tasks.xlsx');

// 输出数据
// console.log(list[0].data);

//修改这里
const user = "admin"
const pass = "admin"
const host = "http://192.168.0.2:8000"

//登陆后获取
let token = "";

function get_token() {
    return new Promise((resolve, reject) => {
        const data = {
            username: user,
            password: md5(pass),
        }

        request(host + '/api/login',
            {
                json: true,
                method: "POST",
                body: data,
                headers: { 'Content-Type': 'application/json' }
            }, (err, res, body) => {
                if (err) {
                    reject(err);
                } else if (body.code === 200) {
                    resolve(body.data.token);
                } else {
                    reject(body.error);
                }
            });
    });
}

/**
 * 
 * @param {String} in_url 
 * @param {String} out_url 
 * @param {Boolean} stream_loop 
 * @param {Boolean} disable_audio 
 * @param {String} comment 
 * @returns 
 */
function create_task(in_url, out_url, stream_loop, disable_audio, comment) {
    return new Promise((resolve, reject) => {
        const data = {
            mode: 0,
            in_url: in_url,
            out_url: out_url,
            stream_loop: stream_loop,
            disable_audio: disable_audio,
            comment: comment,
        }

        request(host + '/api/relay',
            {
                json: true,
                method: "POST",
                body: data,
                headers: { 'Content-Type': 'application/json', 'authorization': token }
            }, (err, res, body) => {
                if (err) {
                    reject(err);
                } else if (body.code === 200) {
                    resolve(body.data);
                } else {
                    reject(body.error);
                }
            });
    });
}

async function run() {
    token = await get_token();

    for (let index = 1; index < list[0].data.length; index++) {
        const element = list[0].data[index];
        // console.log(element)
        let result = await create_task(element[0], element[1], element[2] === 1, element[3] === 1, element[4])
        console.log("create result:",result);
    }

}

run();