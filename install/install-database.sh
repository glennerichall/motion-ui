#!/bin/bash

export DATABASE_NAME=motion
export DATABASE_USER=motion

echo
echo "--------------------------------------------"
echo "This script will install PostgreSQL"
echo "and create motion database and user."
echo "You may be prompted for sudo password."
echo "--------------------------------------------"
echo

read -e -p "Install PostgreSQL database? [y/n] " -i "n" installpg
if [ "$installpg" = "y" ]; then
# Create the file repository configuration:
  sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

  # Import the repository signing key:
  wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

  # Update the package lists:
  sudo apt-get update

  # Install the latest version of PostgreSQL.
  # If you want a specific version, use 'postgresql-12' or similar instead of 'postgresql':
  sudo apt-get -y install postgresql
fi

read -e -p "Create motion Database and user? [y/n] " -i "n" createdb
if [ "$createdb" = "y" ]; then
  sudo -u postgres createuser -D -P DATABASE_USER
  sudo -u postgres createdb -O DATABASE_USER DATABASE_NAME
  echo
  echo "Remember to update motion-global.properties with the motion database password"
  echo
fi

echo
echo "You must update postgresql configuration to allow password based authentication"
echo "(if you have not already done this)."
echo
echo "Add the following to pg_hba.conf or postgresql.conf (depending on version of postgresql installed)"
echo "located in folder /etc/postgresql/<version>/main/ "
echo "    ------->"
echo "host all all 127.0.0.1/32 password"
echo "    <-------"
echo "After you have updated, restart the postgres server:"
echo "sudo service postgresql restart"
echo