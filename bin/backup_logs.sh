#!/bin/sh

echo 'compressing log files...'
TIME=`date +%Y%m%d%H%M%S`

cd ../logs
tar czvf ../logs_$TIME.tar.gz *

echo "compress finished logs_$TIME.tar.gz created"