#!/bin/sh

APP_NAME=environment-health
APP_USERNAME=dwizard
APP_GROUPNAME=dwizard

# Create user and group
getent group ${APP_GROUPNAME} > /dev/null || groupadd -g 1600 -r ${APP_GROUPNAME}
getent passwd ${APP_USERNAME} > /dev/null || useradd -r -m -u 1600 -g ${APP_GROUPNAME} ${APP_USERNAME}

# Uninstall or Update => stop service
if [ "$1" = "0" -o "$1" = "2" ]; then
  service ${APP_NAME} stop
fi

