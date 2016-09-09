#!/bin/sh

#CONFIG_MODE=-dev
CONFIG_MODE=

SERVERS=$1
if [ "$SERVERS" = "" ]; then
        echo 'please indicate which server [cbb100-server|cbb100-dw|lbs|mp|sync|all] to start!'
        exit
fi

#arg1->CBB100 Server name, arg2->TCP port, arg3->HTTP port, arg4->connector.id
startCBB100Server() {
        echo "starting CBB100 TCP Server [$1], log file -> ../../../logs/$1.log, TCP port: [$2], HTTP port: [$3]"
        nohup babel-node --harmony main.js --debug-output=false --tcp.server.port=$2 --http.server.port=$3 --src-dirs=projects/szzh/src --main-class=szzh.cbb100.CBB100ServerMain --config-files=projects/szzh/etc/cbb100-server/cbb100-server$CONFIG_MODE.conf --easynode.app.id=$1 --connector.id=$4 > ../logs/$1.log 2>&1&
}

#arg1->CBB100 DataWriter Name
startCBB100DataWriter() {
        echo "starting CBB100 DataWriter [$1], log file -> ../../../logs/$1.log"
        nohup babel-node --harmony main.js --debug-output=false --src-dirs=projects/szzh/src --main-class=szzh.cbb100.CBB100DWMain --config-files=projects/szzh/etc/cbb100-dw/cbb100-dw$CONFIG_MODE.conf --easynode.app.id=$1 > ../logs/$1.log 2>&1&
}

#arg1->CBB100 LBS Service Name, arg2->LBS Service HTTP port
startLBSService() {
        echo "starting LBS Service [$1], log file -> ../../../logs/$1.log, HTTP port: [$2]"
        nohup babel-node --harmony main.js --debug-output=true --http.server.port=$2 --src-dirs=projects/szzh/src --main-class=szzh.cbb100.LBSServiceMain --config-files=projects/szzh/etc/lbs/lbs-service$CONFIG_MODE.conf --easynode.app.id=$1 > ../logs/$1.log 2>&1&
}

#arg1->Message Push Service Name, arg2->Message Push HTTP port
startMessagePushService() {
        echo "starting Message Push Service [$1], log file -> ../../../logs/$1.log, HTTP port: [$2]"
        nohup babel-node --harmony main.js --debug-output=false --http.port=$2 --src-dirs=projects/szzh/src --main-class=szzh.mp.MessagePushMain --config-files=projects/szzh/etc/mp/message-push$CONFIG_MODE.conf --easynode.app.id=$1 > ../logs/$1.log 2>&1&
}

#arg1->Message Push Service Name, arg2->Message Push HTTP port
startMessagePushServiceTemp() {
        echo "starting temporary Message Push Service [$1], log file -> ../../../logs/$1.log, HTTP port: [$2]"
        nohup babel-node --harmony main.js --debug-output=false --http.port=$2 --src-dirs=projects/szzh/src --main-class=szzh.mp.MessagePushMain --config-files=projects/szzh/etc/mp/message-push-temp.conf --easynode.app.id=$1 > ../logs/$1.log 2>&1&
}

startSyncServer() {
        echo "starting CBB100 DataWriter [$1], log file -> ../../../logs/$1.log"
        nohup babel-node --harmony main.js --debug-output=false --src-dirs=projects/szzh/src --main-class=szzh.cbb100.sync.CBB100SyncMain --config-files=projects/szzh/etc/sync/cbb100-sync$CONFIG_MODE.conf --bean-definitions=projects/szzh/etc/sync/cbb100-sync-beans.json --easynode.app.id=$1 > ../logs/$1.log 2>&1&
}

#change working directory to $root/bin
cd ../../../bin

if [ "$SERVERS" = "all" -o "$SERVERS" = "cbb100-server" ]; then
echo 'starting CBB100 servers...'
#################CBB100 Servers START##############
sleep 1
startCBB100Server 'CBB100HServer01' 6001 6002 000
#################CBB100 Servers END#########################
fi

if [ "$SERVERS" = "all" -o "$SERVERS" = "ydgps" ]; then
echo 'starting YDGPS-Connector...'
#################YDGPS Servers START##############
sleep 1
startCBB100Server 'CBB100Connector-YDGPS' 60000 60001 001
#################YDGPS Servers END#########################
fi

################################################

if [ "$SERVERS" = "all" -o "$SERVERS" = "cbb100-dw" ]; then
#################CBB100 DataWriter START##################
sleep 1
startCBB100DataWriter 'DataWriter01'
#################CBB100 DataWriter END#######################
fi


################################################


if [ "$SERVERS" = "all" -o "$SERVERS" = "lbs" ]; then
#################CBB100 DataWriter START##################
sleep 1
startLBSService 'LBSService01' 7000
#################CBB100 DataWriter END#######################
fi

################################################

if [ "$SERVERS" = "all" -o "$SERVERS" = "mp" ]; then
#################Message Push Service START##################
sleep 1
startMessagePushService 'MPService01' 5000
#################Message Push Service END#######################
fi

if [ "$SERVERS" = "all" -o "$SERVERS" = "sync" ]; then
#################CBB100 Sync Server START##################
sleep 1
startSyncServer 'CBB100Sync'
#################CBB100 Sync Server END#######################
fi

echo 'CBB100 servers started!'