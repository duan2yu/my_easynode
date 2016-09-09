#!/bin/sh


#arg1->Message Push Service Name, arg2->Message Push HTTP port
startMessagePushServiceZhongDou() {
        echo "starting ZhongDou Message Push Service [$1], log file -> ../../../logs/$1.log, HTTP port: [$2]"
        nohup babel-node --harmony main.js --debug-output=true --http.port=$2 --src-dirs=projects/szzh/src --main-class=szzh.mp.MessagePushMain --config-files=projects/szzh/etc/mp/message-push-zhongdou.conf --easynode.app.id=$1 > ../logs/$1.log 2>&1&
}

#arg1->Message Push Service Name, arg2->Message Push HTTP port
startMessagePushServiceZhongDouDev() {
        echo "starting ZhongDou Message Push Service Dev [$1], log file -> ../../../logs/$1.log, HTTP port: [$2]"
        nohup babel-node --harmony main.js --debug-output=true --http.port=$2 --src-dirs=projects/szzh/src --main-class=szzh.mp.MessagePushMain --config-files=projects/szzh/etc/mp/message-push-zhongdou-dev.conf --easynode.app.id=$1 > ../logs/$1.log 2>&1&
}

cd ../../../bin
startMessagePushServiceZhongDou 'ZhongDouMPService' 5000
sleep 3
#startMessagePushServiceZhongDouDev 'ZhongDouMPServiceDev' 5001
#sleep 5