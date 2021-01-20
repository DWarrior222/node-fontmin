#!/bin/bash

set -e

PORT="8000"
REMOTE_USERNAME="root"
REMOTE_HOST="49.235.241.244"
IMAGE_REPOSITORY="luyuan221/fontmin"

function build_image {
  echo "$1 image building..."
  docker build -t $IMAGE_REPOSITORY:$1 $2
  echo "Signing in to docker..."
  docker login -u luyuan221 --password ${pass}
  echo "Pushing..."
  docker image push $IMAGE_REPOSITORY:$1
}

build_image latest .

echo "Signing in to server..."

ssh -tt -i ~/.ssh/id_rsa_travis $REMOTE_USERNAME@$REMOTE_HOST << EOF
docker pull $IMAGE_REPOSITORY:latest || true
docker rm -f fontmin_latest || true
docker run -d --name fontmin_latest -p $PORT:3000 $IMAGE_REPOSITORY:latest

exit
EOF
