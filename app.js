const axios = require('axios');
const os = require('os');
const cluster = require('cluster');
const { workerData } = require('worker_threads');
const app = require('./dist/server').default; 

const numAppServers = os.cpus().length - 1; ; // Change this value to the desired number of application servers
// Application servers
const servers = Array.from({ length: numAppServers }, (_, i) => `http://localhost:300${i}`);
let current = 0;

const serverData = {}

const handler = async (req, res) => {
    const { method, url, headers, body } = req;
    const server = servers[current];
    current === servers.length - 1 ? (current = 0) : current++;
    
    try {
        console.log({
            url: `${server}${url}`,
            method: method,
            headers: headers,
            data: body,
        })
        const response = await axios({
            url: `${server}${url}`,
            method: method,
            headers: headers,
            data: body,
        });
        res.send(response.data);
    } catch (err) {
        res.status(500).send("Server error!");
    }
};
// Worker implementation
const createAppServer = (port, num) => {
    const appServer = app;
    
    // Handler method
    const serverHandler = (req, res) => {
        const { method, url, headers, body } = req;
        res.send(`Response from server ${num}`);
    };
    
    // // Only handle GET and POST requests
    // appServer.get('*', serverHandler).post('*', serverHandler);
    
    // Start server on specified port
    appServer.listen(port, (err) => {
        err
        ? console.log(`Failed to listen on PORT ${port}`)
        : console.log(`Application Server ${num} listening on PORT ${port}`);
    });
};

// Create worker processes
// for (let i = 0; i < numAppServers; i++) {
//     const port = 3000 + i;
//     createAppServer(port, i + 1);
// }
if(cluster.isMaster){
    // const workers = [];
    
    for (let i = 0; i < numAppServers; i++) {
        const worker = cluster.fork();
        // workers.push(worker);
        console.log(worker.id)
        // workerData[`${worker.id}`] = worker.id
        worker.send({
            type: 'handle_request',
            serverNumber: i,
            // Omitting the response object to prevent circular references
        });
        
        // Handle response message from worker
        worker.on('message', (msg) => {
            if (msg && msg.type === 'handle_response') {
                console.log(`Received response from Worker ${worker.process.pid}`);
                // Do something with the response data if needed
            }
        });
        
        // When receiving a new request, pass it to the handler method
        
        // Listen on PORT 8080
        // app.use((req, res) => {
        //     handler(req, res);
        // });
        
    }
    
    cluster.on('exit', (worker,code,signal) => {
        console.log(`Worker ${worker.process.pid} died. Forking a new one...`);
        const newWorker = cluster.fork();
        // workers.push(newWorker);
    });
    let nextWorker = 0;
    
    // Round-robin load balancing
    function getNextWorker() {
        if (nextWorker >= workers.length) {
            nextWorker = 0;
        }
        return workers[nextWorker++];
    }

    // app.listen(8080, (err) => {
    //     err
    //     ? console.log("Failed to listen on PORT 8080")
    //     : console.log("Load Balancer Server listening on PORT 8080");
    // });
    
} else {
    // console.log(process.pid)

    process.on('message', (msg) => {
        if (msg && msg.type === 'handle_request') {
            // console.log("msg",msg)
            // console.log(servers[msg.serverNumber], msg.serverNumber)
            // createAppServer(servers[msg.serverNumber], msg.serverNumber);
            // console.log(servers[msg.serverNumber])
            app.listen(3000+parseInt(msg.serverNumber), (err) => {
                err
                ? console.log(`Failed to listen on PORT ${3000+parseInt(msg.serverNumber)}`)
                : console.log(`Application Server ${msg.serverNumber} listening on PORT ${3000+parseInt(msg.serverNumber)}`);
            });
        }
    })
}



