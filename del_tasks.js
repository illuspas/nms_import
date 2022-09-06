//NodeMediaServer V3 转发任务批量删除工具
//Chen Mingliang 2022-09-06
//https://www.nodemedia.cn/product/node-media-server

const md5 = require('md5');
const request = require('request');

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

function get_relay_list() {
    return new Promise((resolve, reject) => {
        request(host + '/api/relays',
            {
                json: true,
                method: "GET",
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

function del_relay_task(id) {
    return new Promise((resolve, reject) => {
        request(host + '/api/relay/' + id,
            {
                json: true,
                method: "DELETE",
                headers: { 'Content-Type': 'application/json', 'authorization': token }
            }, (err, res, body) => {
                if (err) {
                    reject(err);
                } else if (body.code === 200) {
                    resolve(body.code);
                } else {
                    reject(body.error);
                }
            });
    });
}

async function run() {
    token = await get_token();

    let relays = await get_relay_list();

    for (const id in relays) {
        let ret = await del_relay_task(id);
        console.log("del", id, ret);
    }
}

run();