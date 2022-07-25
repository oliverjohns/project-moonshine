# Moonshine - Exploring the T3 Stack!

Wooohoo!

## Run locally with docker

First you will need to create a `.env` file using the `.env.example` file.

Once you've set up your Postgres instance you will need to run the initial migration:

```
npm run migrate
```

Once you've created the env file run the following command to start Soketi:

```
docker-compose up -d
```
