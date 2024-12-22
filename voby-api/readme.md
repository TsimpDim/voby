# Running Locally
## Docker
You can run this locally using docker by running the following commands:

`docker build -t voby-api --no-cache --progress=plain .`

`docker run -e SECRET_KEY='awd' -e V_DB_HOST='voby-db' -e V_DB_PASSWORD='root' -e V_DB_USER='root' -e V_DB_NAME='voby' -e DJANGO_SUPERUSER_PASSWORD='sup' -e DJANGO_SUPERUSER_USERNAME='D' -e DJANGO_SUPERUSER_EMAIL='noemail@example.com' --network=voby -p 8002:8002 voby-api`

## Docker Compose
...


# Pushing to ECR
Run
`docker build -t voby-api --no-cache --progress=plain .`

Run
`docker tag voby-api x.dkr.ecr.eu-west-1.amazonaws.com/y:latest`

Authenticate with the ECR repo

Run
`docker push x.dkr.ecr.eu-west-1.amazonaws.com/y`