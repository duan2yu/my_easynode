#!/bin/sh

#CONFIG_MODE=-dev
CONFIG_MODE=

cd ../../../bin
nohup babel-node --harmony main.js --src-dirs=projects/szzh-motor-console/src --main-class=szzh.motor.console.MotorConsoleMain --config-files=projects/szzh-motor-console/etc/motor-console$CONFIG_MODE.conf --easynode.app.id=MotorConsoleAPI > ../logs/MotorConsole.log 2>&1&