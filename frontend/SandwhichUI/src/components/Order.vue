<script setup>
import Center from "../genericComponents/CenterOnPage.vue";

const SANDWICH_HAM = 1;
const SANDWICH_HAM_CHEESE = 2;
const SANDWICH_HAM_LETTUCE = 3;
const SANDWICH_HAM_MEATBALL = 4;

const SERVER_A_ADDRESS = "http://localhost:8080";
// Cannot turn this into env variable because we are in Vue env.

let selectedSandwich = 0;
let orderOnGoing = false;

function enableSandwichButtons() {
    // Set all buttons to default class
    document.getElementById("sandwich-ham").classList = "sandwich_button";
    document.getElementById("sandwich-ham-cheese").classList = "sandwich_button";
    document.getElementById("sandwich-lettuce").classList = "sandwich_button";
    document.getElementById("sandwich-ham-meatball").classList = "sandwich_button";

    document.getElementById("sandwich-ham").disabled = false;
    document.getElementById("sandwich-ham-cheese").disabled = false;
    document.getElementById("sandwich-lettuce").disabled = false;
    document.getElementById("sandwich-ham-meatball").disabled = false;
}

function disableSandwichButtons() {
    // Set all buttons to disabled class
    document.getElementById("sandwich-ham").classList = "sandwich_button_disabled";
    document.getElementById("sandwich-ham-cheese").classList = "sandwich_button_disabled";
    document.getElementById("sandwich-lettuce").classList = "sandwich_button_disabled";
    document.getElementById("sandwich-ham-meatball").classList = "sandwich_button_disabled";

    document.getElementById("sandwich-ham").disabled = true;
    document.getElementById("sandwich-ham-cheese").disabled = true;
    document.getElementById("sandwich-lettuce").disabled = true;
    document.getElementById("sandwich-ham-meatball").disabled = true;

    selectedSandwichDisabled();
}

function setSelectedSanwich() {
    if (selectedSandwich === SANDWICH_HAM) { document.getElementById("sandwich-ham").classList = "sandwich_button_selected";}
    if (selectedSandwich === SANDWICH_HAM_CHEESE) { document.getElementById("sandwich-ham-cheese").classList = "sandwich_button_selected";}
    if (selectedSandwich === SANDWICH_HAM_LETTUCE) { document.getElementById("sandwich-lettuce").classList = "sandwich_button_selected";}
    if (selectedSandwich === SANDWICH_HAM_MEATBALL) { document.getElementById("sandwich-ham-meatball").classList = "sandwich_button_selected";}
}

function selectedSandwichDisabled() {
    if (selectedSandwich === SANDWICH_HAM) { document.getElementById("sandwich-ham").classList = "sandwich_button_selected_disabled";}
    if (selectedSandwich === SANDWICH_HAM_CHEESE) { document.getElementById("sandwich-ham-cheese").classList = "sandwich_button_selected_disabled";}
    if (selectedSandwich === SANDWICH_HAM_LETTUCE) { document.getElementById("sandwich-lettuce").classList = "sandwich_button_selected_disabled";}
    if (selectedSandwich === SANDWICH_HAM_MEATBALL) { document.getElementById("sandwich-ham-meatball").classList = "sandwich_button_selected_disabled";}
}

function enableOrderButtoon() {
    document.getElementById("order-button").disabled = false;
    document.getElementById("order-button").classList = "order_button";
}

function disableOrderButtoon() {
    document.getElementById("order-button").disabled = true;
    setTimeout(() => {
        document.getElementById("order-button").classList = "order_button_disabled";
    }, 250);  
}

function selectSandwich(id) {

    // Reset buttons to default
    enableSandwichButtons();

    // Set selected sandwich icon class
    document.getElementById(id).classList = "sandwich_button_selected"

    switch (id) {
        case 'sandwich-ham':
            selectedSandwich = SANDWICH_HAM;
            break;
        case 'sandwich-ham-cheese':
            selectedSandwich = SANDWICH_HAM_CHEESE;
            break;
        case 'sandwich-lettuce':
            selectedSandwich = SANDWICH_HAM_LETTUCE;
            break;
        case 'sandwich-ham-meatball':
            selectedSandwich = SANDWICH_HAM_MEATBALL;
            break;
        default:
            selectedSandwich = 0;
            break;
    }

    if(selectedSandwich === 0) {
        document.getElementById("order-button").classList = "order_button_disabled";
    } else {
        document.getElementById("order-button").classList = "order_button";
    }

}


function UIstatusChanger(orderstatus) {
    // Informs the user about the status of the order.
    switch (orderstatus) {
        case 'ordered':
            document.querySelector(".order_status").textContent = "Order status: Sending order request...";
            disableSandwichButtons();
            disableOrderButtoon();
            break;
        case 'received':
            document.querySelector(".order_status").textContent = "Order status: Order received, sending it into queue...";
            disableSandwichButtons();
            disableOrderButtoon();
            break;
        case 'inQueue':
            document.querySelector(".order_status").textContent = "Order status: Order in queue, waiting for preparation...";
            disableSandwichButtons();
            disableOrderButtoon();
            break;
        case 'ready':
            document.querySelector(".order_status").textContent = "Order status: Order ready!";
            enableSandwichButtons();
            enableOrderButtoon();
            break;
        case 'failed':
            document.querySelector(".order_status").textContent = "Order status: Order failed. Please try again later.";
            enableSandwichButtons();
            enableOrderButtoon();
            setSelectedSanwich();
            break;
        default:
            break;
    }
}


function startOrder() {
    if(selectedSandwich !== 0) {
        // This if-statement is a double verification to be sure that NO sandwich has yet been selected.
        console.log("Started order for sandwich number", selectedSandwich);
        orderOnGoing = true;

        UIstatusChanger('ordered');

        // We set the timeout for the user experience.
        setTimeout(() => {
            const data = {
                id: generateOrderId(),
                sandwichId: selectedSandwich,
                status: "ordered"
            };
            fetch(SERVER_A_ADDRESS + '/order/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
                })
                .then(response => {
                    response = response.json();
                    response.then(data => {
                        UIstatusChanger(data.status);
                        // Now we start to listen for the answer.
                        trackOrderStatus(1000, data);
                    })
                })
                .catch(error => {
                    UIstatusChanger('failed');
                    console.error('Error placing order:', error);
                });
        }, 500);
    }
}


function generateOrderId() {
    const length = 10; // ID's lenght
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }


function trackOrderStatus(time_interval, data) {
    let i = 0;
    let current_data = data;
    const intervalId = setInterval(() => {
        fetch(SERVER_A_ADDRESS +'/order/' + data.id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            })
            .then(response => {
                response = response.json();
                response.then(data => {
                    // console.log('Got response with data:', data);
                    UIstatusChanger(data.status);
                    if (data.status === 'ready' ) {
                        clearInterval(intervalId);
                    } else if (data.status === 'failed') {
                        console.log("Order has failed.");
                        clearInterval(intervalId);
                    }
                })
            })
            .catch(error => {
                UIstatusChanger('failed');
                console.error('Error placing order:', error);
                clearInterval(intervalId)
            });

    }, time_interval);
}


</script>

<template >
    <Center>
        <div class="window">
            <h1>Choose your sandwich!</h1>
            <div class="sandwich_div">
                <div>
                    <button class="sandwich_button" id="sandwich-ham" @click="selectSandwich('sandwich-ham')">
                        <img src="../assets/sandwich_img/sandwich-ham.svg" alt="">
                        <p>Ham</p>
                    </button>
                </div>
                <div>
                    <button class="sandwich_button" id="sandwich-ham-cheese" @click="selectSandwich('sandwich-ham-cheese')">
                        <img src="../assets/sandwich_img/sandwich-ham-cheese.svg" alt="">
                        <p>Ham & Cheese</p>
                    </button>
                </div>
                <div>
                    <button class="sandwich_button" id="sandwich-lettuce" @click="selectSandwich('sandwich-lettuce')">
                        <img src="../assets/sandwich_img/sandwich-lettuce.svg" alt="">
                        <p>Lettuce</p>
                    </button>
                </div>
                <div>
                    <button class="sandwich_button" id="sandwich-ham-meatball" @click="selectSandwich('sandwich-ham-meatball')">
                        <img src="../assets/sandwich_img/sandwich-ham-meatball.svg" alt="">
                        <p>Ham &  Meatball</p>
                    </button>
                </div>
            </div>
            <button class="order_button_disabled" id="order-button" @click="startOrder()">Start your order!</button>
            <p class="order_status">Order status: Waiting for your order!</p>
        </div>
    </Center>
</template>

<style >

* {
    padding: 0;
    margin: 0;
}

.window {
    width: 700px;
    border-radius: 40px;
    background-color: #393053;
    box-shadow: 0px 0px 10px #18122B;
    color: white;
    text-align: center;
}

.window h1 {
    padding: 25px 0;
    font-weight: 500;
    font-size: 35px;
}

.sandwich_div {
    display: flex;
    justify-content: center;
}

.sandwich_div div {
    margin: 0 5px;
}

.sandwich_div:hover img, .sandwich_div:hover p, .sandwich_div:hover button{
    cursor: pointer;
}

.sandwich_div div:hover img {
    height: 105px;
    width: 105px;
    transition: 0.3s;
}

.sandwich_div div:hover p {
    font-size: 16px;
    transition: 0.3s;
}

.sandwich_div p {
    color: white;
    font-weight: 600;
    font-size: 15px;
    height: 20px;
    margin: 0 0 8px 0;
    transition: 0.3s;
}

.sandwich_button {
    background-color: #393053;
    border: transparent 4px solid;
    border-radius: 25px;
    width: 150px;
    height: 150px;
    transition: 0.3s;
    cursor: pointer;
}

.sandwich_button_disabled {
    background-color: #393053;
    border: transparent 4px solid;
    border-radius: 25px;
    width: 150px;
    height: 150px;
    transition: 0.3s;
    cursor: pointer;
    opacity: 0.4;
}

.sandwich_button_selected {
    background-color: #393053;
    border: white 4px solid;
    border-radius: 25px;
    width: 150px;
    height: 150px;
    transition: 0.3s;
}

.sandwich_button_selected_disabled {
    background-color: #393053;
    border: white 4px solid;
    border-radius: 25px;
    width: 150px;
    height: 150px;
    transition: 0.3s;
    opacity: 0.4;
}

img {
    height: 100px;
    width: 100px;
    transition: 0.3s;
}


.sandwich_button:hover, .sandwich_button_selected:hover {
    background-color: #635985;
    transition: 0.3s;
}

.order_button {
    position: relative;
    color: white;
    background-color: #393053;
    font-weight: 500;
    border-radius: 15px;
    padding: 20px;
    margin-top: 40px;
    font-size: 25px;
    border: white 4px solid;
    transition: 0.3s;
    -webkit-transition-duration: 0.3s; /* Safari */
    transition-duration: 0.3s;
    overflow: hidden;
    cursor: pointer;
}

.order_button:after {
  content: "";
  background: whitesmoke;
  display: block;
  position: absolute;
  padding-top: 300%;
  padding-left: 350%;
  margin-left: -20px!important;
  margin-top: -120%;
  opacity: 0;
  transition: all 0.8s
}

.order_button:active:after {
  padding: 0;
  margin: 0;
  opacity: 1;
  transition: 0s
}

.order_button_disabled {
    color: white;
    background-color: #393053;
    font-weight: 500;
    border-radius: 15px;
    padding: 20px;
    margin-top: 40px;
    font-size: 25px;
    border: white 4px solid;
    transition: 0.3s;
    opacity: 0.4;
}

.window .order_button:hover {
    background-color: #635985;
    transition: 0.3s;
}

.order_status{
    font-size: 20px;
    font-weight: 500;
    margin: 40px 0px;
}

</style>