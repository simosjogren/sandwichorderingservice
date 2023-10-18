# Group school-project for sandwichordering demo

# Main frontend view:
![sandwichwindow](https://github.com/simosjogren/sandwichorderingservice/assets/50803295/59fcdee9-9a52-48d3-998f-079abe1fec71)

# Overall system architecture:
![PIC1](https://github.com/simosjogren/sandwichorderingservice/assets/50803295/4171475e-5c49-4073-858e-4c7d59d40585)


# Backend order sequence diagram:
![PIC2](https://github.com/simosjogren/sandwichorderingservice/assets/50803295/f198b24c-5503-402b-ac64-697040e5dee1)

# Creating the database for the first time
When in docker-compose, you can try to make own commands into a database by typing:

1. docker-compose build
2. docker-compose up -d
3. docker exec -it sjb-db-1 psql -U myuser -d postgres_db

And then you can access the shell of the postgresql database.
When accessed the database, you should create a new database and new table called orders for the system to work

# Implementing a rabbitmq broker
Login to the control page of the broker and create a new queues for messaging.
