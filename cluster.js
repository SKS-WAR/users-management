// cluster.js

const cluster = require('cluster');
const os = require('os');
const http = require('http');
const app = require('./dist/server').default; // Adjust the path based on your project structure

if (cluster.isMaster) {
  const numCPUs = os.cpus().length - 1; // Number of available parallelism - 1
  const workers = [];

  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workers.push(worker);

    // Handle response message from worker
    worker.on('message', (msg) => {
      if (msg && msg.type === 'handle_response') {
        console.log(`Received response from Worker ${worker.process.pid}`);
        // Do something with the response data if needed
      }
    });
  }

  let nextWorker = 0;

  // Round-robin load balancing
  function getNextWorker() {
    if (nextWorker >= workers.length) {
      nextWorker = 0;
    }
    return workers[nextWorker++];
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Forking a new one...`);
    const newWorker = cluster.fork();
    workers.push(newWorker);
  });

  // Create a simple HTTP server for load balancing
  const server = http.createServer((req, res) => {
    const worker = getNextWorker();
    worker.send({
      type: 'handle_request',
      requestUrl: req.url,
      // Omitting the response object to prevent circular references
    });
  });

  server.listen(process.env.PORT || 4000, () => {
    console.log(`Load balancer listening on port ${process.env.PORT || 4000}`);
  });
} else {
  // Workers share the TCP connection in this server
  process.on('message', (msg) => {
    if (msg && msg.type === 'handle_request') {
      // Process the request with the app
      const req = { url: msg.requestUrl };
      const res = {
        end: (data) => {
          // Send the response data back to the master process
          process.send({ type: 'handle_response', responseData: data });
        },
      };
      app(req, res);
    }
  });
}
