# This is where you define the image for
# the server A, which implements the Swagger API.

# Start by copying the server stub to this directory.

# You should then use Noje image from Docker Hub as the basis,
# and then follow the instructions linked to in assignment document.
# You should be able to produce a working installation by just
# following the instructions.

# First line is provided for your convenience.
# This line fetches the Node Docker image with tag "10"
# from Docker Hub.

## SJB: Start the docker environment in Poweshell with two commands in current direction: 
## docker-compose build
## docker-compose up

FROM node:10

COPY . .

RUN npm install

EXPOSE 8080

CMD ["node", "server.js"]