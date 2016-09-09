#!/bin/sh

echo 'generating api docs for project message-push ...'
apidoc -i ../src/szzh/mp -o ../docs/api-docs/message-push

echo 'generating api docs for project cbb100-server ...'
apidoc -i ../src/szzh/cbb100 -o ../docs/api-docs/cbb100-server
