Here's a sample `README.md` file for your npm package `@tasklyhub/scheduler`. This readme provides a general overview of the package, installation instructions, usage examples, and more.

# @tasklyhub/scheduler

TasklyHub Scheduler is an npm package designed to manage and execute scheduled tasks in a Node.js application. It includes worker threads for processing, polling, and task execution, leveraging MongoDB for data persistence and AWS SQS for queue management.

## Features

- **Processor Worker**: Processes messages from a queue and performs tasks.
- **Polling Worker**: Polls the database for tasks that are due and queues them.
- **Task Executor Worker**: Executes registered callbacks for queued tasks.
- **Callback Registry**: Register and manage callback functions for task execution.
- **MongoDB Integration**: Seamless integration with MongoDB for task storage.
- **AWS SQS Integration**: Manage tasks in AWS SQS queues.

## Installation

You can install the package via npm:

```sh
npm install @tasklyhub/scheduler
```

## Usage

### Basic Setup

Below are examples of how to set up and start the workers.

#### Processor Worker

```javascript
const { MongoDB, Queue, ProcessorWorker } = require("@tasklyhub/scheduler");

const db = new MongoDB("mongodb://localhost:27017", "scheduler", "schedules");

const queue1 = new Queue(
  "http://localhost:9324/000000000000/my-queue",
  "ap-south-1",
  { accessKeyId: "NA", secretAccessKey: "NA" }
);

const processorWorker = new ProcessorWorker(queue1, db);
processorWorker.startWorker();
```

#### Polling Worker

```javascript
const { MongoDB, Queue, PollingWorker } = require("@tasklyhub/scheduler");

const db = new MongoDB("mongodb://localhost:27017", "scheduler", "schedules");

const queue2 = new Queue(
  "http://localhost:9324/000000000000/my-queue-2",
  "ap-south-1",
  { accessKeyId: "NA", secretAccessKey: "NA" }
);

const pollingWorker = new PollingWorker(queue2, db);
pollingWorker.startWorker();
```

#### Task Executor Worker

```javascript
const {
  Queue,
  TaskExecutorWorker,
  CallbackRegistry,
} = require("@tasklyhub/scheduler");

const queue2 = new Queue(
  "http://localhost:9324/000000000000/my-queue-2",
  "ap-south-1",
  { accessKeyId: "NA", secretAccessKey: "NA" }
);

const registry = CallbackRegistry.getInstance();

registry.registerCallback("myCallback", (message) => {
  console.log("Callback executed with message:", message);
});

const taskExecutor = new TaskExecutorWorker(queue2);
taskExecutor.startExecutorWorker();
```

### Running Workers Independently

To leverage multiple cores and run workers independently of your main Express application, use worker threads or child processes.

#### Using Worker Threads

```javascript
const { Worker } = require("worker_threads");

function runWorker(workerFile) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerFile);
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

// Start processor worker
runWorker("./processorWorker.js").catch((err) => console.error(err));

// Start polling worker
runWorker("./pollingWorker.js").catch((err) => console.error(err));

// Start task executor worker
runWorker("./taskExecutorWorker.js").catch((err) => console.error(err));
```

#### Using Child Processes

```javascript
const { fork } = require("child_process");

function startWorker(workerFile) {
  const worker = fork(workerFile);

  worker.on("error", (error) => {
    console.error(`Worker ${workerFile} encountered an error:`, error);
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Worker ${workerFile} stopped with exit code ${code}`);
    }
  });
}

// Start processor worker
startWorker("./processorWorker.js");

// Start polling worker
startWorker("./pollingWorker.js");

// Start task executor worker
startWorker("./taskExecutorWorker.js");
```

### Main Express Application

Ensure your main Express application is in a separate file and does not directly manage the worker processes.

#### `app.js`

```javascript
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

Run the main worker manager script to start all workers:

```sh
node index.js
```

Run your Express application separately:

```sh
node app.js
```

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss any changes or improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```

Feel free to modify the content as per your specific package details and usage scenarios.
```
