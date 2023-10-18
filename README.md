# Creating the database for the first time
When in docker-compose, you can try to make own commands into a database by typing:

1. docker-compose build
2. docker-compose up -d
3. docker exec -it sjb-db-1 psql -U myuser -d postgres_db

And then you can access the shell of the postgresql database.
When accessed the database, you should create a new database and new table called orders for the system to work

# Implementing a rabbitmq broker
Login to the control page of the broker and create a new queues for messaging.