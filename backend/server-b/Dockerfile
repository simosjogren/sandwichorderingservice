# This is where you define the image for
# the server B which processes the orders.

# You should then use Noje image from Docker Hub as the basis,
# and then follow the instructions linked to in assignment document.
# You should be able to produce a working installation by just
# following the instructions.

# First line is provided for your convenience.
# This line fetches the Node Docker image from Docker Hub
# which has been tagged "10"
FROM node:10

COPY . .

RUN npm install

EXPOSE 8081

#       command: ["./utils/wait-for-it.sh", "rapid-runner-rabbit:5672", "--",  "npm", "start"]

CMD ["node", "server.js"]