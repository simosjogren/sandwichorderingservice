// SJB Server-b
// Authors: Simo Sjögren, Joona Jokipii, Eero Piipari

var amqp = require('amqplib');
const { Pool } = require('pg');

const broker = require('../rabbit-utils/sendTask');
const RABBITMQ_ADDRESS = process.env.RABBITMQ_USER + ':' + process.env.RABBITMQ_PASS + '@' + process.env.RABBITMQ_HOST + ':' + process.env.RABBITMQ_PORT;
const QUEUE_NAME_RECEIVE = 'orderQueue'; // RabbitMQ queue name
const QUEUE_NAME_SEND = 'completedOrdersQueue'; // RabbitMQ queue name

// This authenticates the communication between server-b and database.
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
});


// This timeout is created because wait_for_sh does not work yet....
// TODO FIX.
var timeoutId = setTimeout(function() {
  var connection = getTask(RABBITMQ_ADDRESS, QUEUE_NAME_RECEIVE);
}, 25000);

function getTask(rabbitHost, queueName){
    amqp.connect('amqp://' + rabbitHost).then(function(conn) {
      process.once('SIGINT', function() { conn.close(); });
      return conn.createChannel().then(function(ch) {
        var ok = ch.assertQueue(queueName, {durable: true});
        ok = ok.then(function() { ch.prefetch(1); });
        ok = ok.then(function() {
          ch.consume(queueName, doWork, {noAck: false});
          console.log(new Date(), " [*] Waiting for messages. To exit press CTRL+C");
        });
        return ok;
  
        function doWork(msg) {
          var body = JSON.parse(msg.content.toString());
          console.log("Received '%s'", body);
          var milliseconds = getRandomDelay() * 1000; // delay
          console.log("Task takes %d milliseconds", milliseconds);
          body.status = 'inQueue';
          // Saves status of the order into a database
          saveInformationToDatabase(body)
          setTimeout(function() {
            body.status = 'ready';
            // Sends confirmation of completed order
            sendMessageToBroker(body);

            saveInformationToDatabase(body)
            
            console.log(new Date(), " [x] Done");
            ch.ack(msg);
          }, milliseconds);
        }
      });
    }).catch(console.warn);
  }
  
function getRandomDelay() {
  return Math.floor(Math.random() * 6) + 5;
}


function sendMessageToBroker(data) {
  broker.addTask(RABBITMQ_ADDRESS, QUEUE_NAME_SEND, data);
  console.log("Order ready with data ", data);
};

function saveInformationToDatabase(data) {
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
        console.log('Row inserted successfully!');
      }
    });
};