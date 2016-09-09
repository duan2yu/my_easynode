#!/bin/sh

stopService() {
        echo "shutting down service [$1]..."
        PID=`ps -ef|grep node |grep "$1" |grep -v grep |grep -v "/babel-node" |awk '{print $2}'`
        if [ -n "$PID" ]; then
                echo "kill server [$1] process -> $PID"
                kill -9 $PID
        fi
}

#change working directory to $root/bin
cd ../../../bin
echo 'shutting down YDGPS services...'

stopService 'YDGPS-WEB'
sleep 2