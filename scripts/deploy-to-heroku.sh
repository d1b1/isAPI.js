#!/bin/bash

#
# Automatically deploy to heroku from Travis-CI job using HEROKU_API_KEY.
# 
# See http://www.neilmiddleton.com/deploying-to-heroku-from-travis-ci/
#

HEROKU_APP_NAME="isapi-js-demo"

if [ "$HEROKU_API_KEY" == "" ]
then
    echo "Unable to deploy to heroku. Please set the environment variable HEROKU_API_KEY."
    exit 1
fi

# First, we have to install the heroku key belt
wget -qO- https://toolbelt.heroku.com/install-ubuntu.sh | sh

# Get rid of ssh "The authenticity of host can't be established" warnings 
# (and the blocking of the terminal caused by them).
echo "Host heroku.com" >> ~/.ssh/config
echo "   StrictHostKeyChecking no" >> ~/.ssh/config
echo "   CheckHostIP no" >> ~/.ssh/config
echo "   UserKnownHostsFile=/dev/null" >> ~/.ssh/config

# Add the heroku git as remote
git remote add heroku git@heroku.com:$HEROKU_APP_NAME.git

# If th environment variable HEROKU_API_KEY is set, the auth:login-command returns (almost) immediately
# If for some reason the key is not set (or not correct), the auth:login-command asks the user to type
# his heroku-credentials (and thus blocks the terminal). Because we do not want to wait for travis-ci
# to shutdown the stalled job in this case (normally after ~10min), we use timeout here.
timeout --kill-after=10s 10s heroku auth:login

if [ $? -ne 0 ]
then 
    echo "Unable to deploy to heroku. Did you provide a correct HEROKU_API_KEY?"
    exit 1
fi

# Now we can add the ssh key to the heroku account
heroku keys:clear
yes | heroku keys:add

# A final git-push will deploy the application
yes | git push heroku master