##!/bin/bash

echo "Creating quackage test environment..."

mkdir testenv
cp ../test/packagefiles/clean-debug-package.json testenv/package.json
cd testenv
npm install