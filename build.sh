#!/bin/sh

docker image pull luyuan221/fontmin:latest

#判断容器是否有启动
#docker container kill d96f7912b45a

#判断容器是否存在
#docker container rm d96f7912b45a

docker container run -p 8000:3000 luyuan221/fontmin:latest