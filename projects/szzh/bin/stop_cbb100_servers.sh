#!/bin/sh

SERVERS=$1
if [ "$SERVERS" = "" ]; then
        echo 'please indicate which server [cbb100-server|cbb100-dw|lbs|mp|sync|all] to stop!'
        exit
fi

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
echo 'shutting down CBB100 servers...'

if [ "$SERVERS" = "all" -o "$SERVERS" = "cbb100-server" ]; then
sleep 1
stopCBB100Server 'CBB100HServer01'
fi

if [ "$SERVERS" = "all" -o "$SERVERS" = "ydgps" ]; then
sleep 1
stopCBB100Server 'CBB100Connector-YDGPS'
fi

if [ "$SERVERS" = "all" -o "$SERVERS" = "cbb100-dw" ]; then
sleep 1
stopCBB100Server 'DataWriter01'
fi


if [ "$SERVERS" = "all" -o "$SERVERS" = "lbs" ]; then
sleep 1
echo 'Pausing LBS service, please wait 30 seconds to wait for serving created request...'
wget http://127.0.0.1:7000/stop?password=zlbbq47054370 >> /dev/null
sleep 20
stopCBB100Server 'LBSService01'
fi

if [ "$SERVERS" = "all" -o "$SERVERS" = "mp" ]; then
sleep 1
stopCBB100Server 'MPService01'
fi

if [ "$SERVERS" = "all" -o "$SERVERS" = "sync" ]; then
sleep 1
stopCBB100Server 'CBB100Sync'

#################CBB100 MessagePushService END#######################
fi


echo 'CBB100 servers shutdown!'