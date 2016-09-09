#!/bin/sh

echo 'Generating EasyNode documents, please wait...'
rm -fr ../docs/*
yuidoc
echo 'EasyNode documents has been generated at docs/'