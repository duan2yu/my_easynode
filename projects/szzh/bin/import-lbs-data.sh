#!/bin/sh

#change working directory to $root/bin
cd ../../bin
babel-node --harmony main.js --src-dirs=projects/szzh/src --main-class=projects/szzh.cbb100.LBSDataImportMain --config-files=projects/szzh/lbs-import.conf