const axios = require('axios');
const os = require('os');
const { workerData } = require('worker_threads');
const app = require('./dist/server').default; 
const request = require('request')
const express = require('express')


const numAppServers = os.cpus().length - 1; ; // Change this value to the desired number of application servers
// Application servers
const servers = Array.from({ length: numAppServers }, (_, i) => `http://localhost:300${i}`);

let current = 0;

const handler = (req,res) => {

    const server = servers[current];
    console.log("server working ",server)

    req.pipe(request({url:server+req.url})).pipe(res);

    current = (current+1)%servers.length;
}

const lbServer = express();


lbServer.use((req,res)=>handler(req,res));

lbServer.listen(8080,err => {
    err?console.log("Failed to listen on port 8080") :console.log("LB : Load Balancer working on 8080");
})