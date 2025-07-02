#!/bin/sh

# This script is used to start the Node.js application with a memory limit to match requirements
exec node --max-semi-space-size=4 index.mjs 100000 30