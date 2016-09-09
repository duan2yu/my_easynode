#!/bin/sh

#arg1->MotorConsoleAPI
stopMotorConsoleServer() {
        echo "shutting down MotorConsoleAPI Server..."
        PID=`ps -ef|grep node |grep "$1" |grep -v grep |grep -v "/babel-node" |awk '{print $2}'`
        if [ -n "$PID" ]; then
                echo "kill server [$1] process -> $PID"
                kill -9 $PID
        fi
}

#change working directory to $root/bin
cd ../../../bin
stopMotorConsoleServer 'MotorConsoleAPI'