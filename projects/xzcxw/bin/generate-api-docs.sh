#!/bin/sh

echo 'generating api docs for admin-console...'
apidoc -i ../sub-systems/admin-console/src -o ../sub-systems/admin-console/www/admin-console/api-docs

echo 'generating api docs for site-api...'
apidoc -i ../sub-systems/site-api/src -o ../sub-systems/site-api/www/site-api/api-docs
