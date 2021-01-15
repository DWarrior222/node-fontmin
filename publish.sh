#!/bin/sh
APP_NAME="luyuan221/fontmin"

cur_sec=`date '+%s'`
cur_ns=`date '+%N'`
cur_timestamp=$((`date '+%s'`*1000+`date '+%N'`/1000000))

docker image build -t $APP_NAME:latest .
docker login -u luyuan221 --password shuai2121
docker image push $APP_NAME:latest

echo 'build success'