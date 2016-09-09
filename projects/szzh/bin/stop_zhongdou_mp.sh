#!/bin/sh

#arg1->CBB100 Server name
stopCBB100Server() {
        echo "shutting down CBB100 Server [$1]..."
        PID=`ps -ef|grep node |grep "$1" |grep -v grep |grep -v "/babel-node" |awk '{print $2}'`
        if [ -n "$PID" ]; then
                echo "kill server [$1] process -> $PID"
                kill -9 $PID
        fi
}

#change working directory to $root/bin
cd ../../../bin
echo 'shutting down ZhongDou message push servers...'

stopCBB100Server 'ZhongDouMPService'
sleep 2
#stopCBB100Server 'ZhongDouMPServiceDev'
#sleep 2