#!/bin/sh

#arg1->APP Name, arg2->Http Port
startService() {
        echo "starting YDGPS Service [$1], log file -> ../../../logs/$1.log, HTTP port: [$2]"
        nohup babel-node --harmony main.js --src-dirs=projects/ydgps/sub-systems/web/src --main-class=szzh.ydgps.web.Main --config-files=projects/ydgps/sub-systems/web/etc/ydgps-web.conf --bean-definitions=projects/ydgps/sub-systems/web/etc/ydgps-web-beans.json --app.id=$1 > ../logs/$1.log 2>&1&
}

cd ../../../bin
startService 'YDGPS-WEB' 10000