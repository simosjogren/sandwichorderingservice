// SJB Server-a
// Authors: Simo Sjögren, Joona Jokipii, Eero Piipari

const http = require('http');
var amqp = require('amqplib');
const { Pool } = require('pg');

// This authenticates the communication between server-a and database.
const pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
});

const broker = require('../rabbit-utils/sendTask')

const RABBITMQ_ADDRESS = process.env.RABBITMQ_USER + ':' + process.env.RABBITMQ_PASS + '@' + process.env.RABBITMQ_HOST + ':' + process.env.RABBITMQ_PORT;
// const FRONTEND_ADDRESS = "http://localhost:3000";
// const RABBITMQ_ADDRESS = "guest:guest@rapid-runner-rabbit:5672";
const QUEUE_NAME_SEND = 'orderQueue'; // RabbitMQ queue name
const QUEUE_NAME_RECEIVE = 'completedOrdersQueue'; // RabbitMQ queue name
// To pickup the same address in docker environemnt from env-vars, uncomment next line:
// const FRONTEND_ADDRESS = process.env.FRONTEND_ADDRESS;

const server = http.createServer((req, res) => {

    // RabbitMQ receiver
    var connection = getTask(RABBITMQ_ADDRESS, QUEUE_NAME_RECEIVE);

    // CORS setup
    console.log("Message arrived.")
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    let url_array = req.url.split('/');
    
    // Filter out the empty strings in the array.
    url_array = url_array.filter(item => item);

    if (req.method === 'OPTIONS') {
        // Initialization method.
        console.log("OPTIONS-request received")
        res.writeHead(200, {'Content-Type' : 'application/json'});
        res.write("{}")
        res.end();
    } 

    else if (req.method === 'GET' && url_array.length === 2 && url_array[0] === 'order') {
        // Method for getting a status of a given order.
        let order_id = url_array[1];
        console.log("Requested order number: ", order_id);
        res.writeHead(200, {'Content-Type' : 'application/json'});
        // TODO return the real value from the database instead of "{}"
        let data = {
            id: order_id,
            sandwichId: null,
            status: null,
        }
        pool.query("SELECT * FROM orders WHERE id = $1", [data.id], (err, res2) => {
            if (err) {
                console.error(err);
                data.status = "failed"
            } else {
                console.log('Row retrieved succesfully, retrieved data:', res2.rows[0]);
                data = res2.rows[0];
            }
            res.write(JSON.stringify(data));
            res.end();
        });
    }
    
    else if (req.method === 'POST' && url_array[0] === 'order') {
        // Method for starting a new order.
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const data = JSON.parse(body);
            console.log('Received order:', data);
            data.status = "received";
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(data));
            res.end();

            // Saves status of the order into a database
            saveInformationToDatabase(data);

            // Now time to contact the broker and send information to Server B.
            sendMessageToBroker(data);
        });
    } else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.write('{}');
        res.end();
  }
});


function saveInformationToDatabase(data) {
    const sql = `
        INSERT INTO orders (id, sandwich_id, status)
        VALUES ($1, $2, $3);
        `;
    const values = [data.id, data.sandwichId, data.status];
    pool.query(sql, values, (err, res) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Row inserted successfully!');
        }
      });
};


function getTask(rabbitHost, queueName){
    amqp.connect('amqp://' + rabbitHost).then(function(conn) {
      process.once('SIGINT', function() { conn.close(); });
      return conn.createChannel().then(function(ch) {
        var ok = ch.assertQueue(queueName, {durable: true});
        ok = ok.then(function() { ch.prefetch(1); });
        ok = ok.then(function() {
          ch.consume(queueName, doWork, {noAck: false});
        });
        return ok;
  
        function doWork(msg) {
          var body = JSON.parse(msg.content.toString());
          var milliseconds = 0; // delay
          setTimeout(function() {
            
            // Sends confirmation of completed order
            updateInformationInDatabase(body)
            
            console.log(new Date(), " [x] Done");
            ch.ack(msg);
          }, milliseconds);
        }
      });
    }).catch(console.warn);
  }


  function updateInformationInDatabase(data) {
    const sql = `
        UPDATE orders
        SET status = $1
        WHERE id = $2;
        `;
    const values = [data.status, data.id];
    pool.query(sql, values, (err, res) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Row updated successfully ID: ', data.id, ' and status: ', data.status);
        }
      });
};


function sendMessageToBroker(data) {
    console.log("Sending message to the broker...");
    broker.addTask(RABBITMQ_ADDRESS, QUEUE_NAME_SEND, data)
    console.log('Order', data.id ,'sent to broker..');
};


function launchServer(port) {
    console.log("Starting up server A...");
    server.listen(port, () => {
        console.log('Server running on port', port);
      });
};


launchServer(8080);



