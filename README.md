# Motion Front-End Application

Typical installation has front-end installed on same server as motion.

## 1. Install Postgresql

### 1.1 Run install script (or install it manually)
```bash
./install/install-database.sh
```

@see [Postgresql](https://www.postgresql.org/download/linux/ubuntu/)

### 1.2. Update Postgresql config

You must update postgresql configuration to allow password based authentication (if you have not already done this).

Add the following to `pg_hba.conf` or `postgresql.conf` (depending on version of postgresql installed) located in folder `/etc/postgresql/<version>/main/`
```
host all all 127.0.0.1/32 password
```

After you have updated, restart the postgres server:
```bash
sudo service postgresql restart
```


## 2. Install motion

### 2.1 Install motion

```bash
sudo apt-get install motion
```

@see [motion-project](https://motion-project.github.io/motion_build.html)

### 2.2 Configure motion

Add the following configurations to `motion.conf`

```
############################################################
# Database configuration parameters
############################################################
database_type postgresql
database_dbname motion
database_user motion
database_password YOUR_PASSWORD_DEFINED_AT_STEP_1
database_port 5432
sql_query_start insert into event_logs(camera, event, begin, end) values('%t', '%t.%v.%C', '%Y-%m-%d %T', null)
sql_query insert into events(camera, event, time, type, frame, filename) values('%t', '%t.%v.%C', '%Y-%m-%d %T', '%n', %q, '%f')
sql_query_stop update event_logs set end='%Y-%m-%d %T' where camera='%t' and event='%t.%v.%C'

############################################################
# Script execution configuration parameters
############################################################
on_event_start /usr/bin/curl --location --request POST 'localhost:3000/v1/events/%t/status?type=start'
on_event_end /usr/bin/curl --location --request POST 'localhost:3000/v1/events/%t/status?type=end'
on_camera_lost /usr/bin/curl --location --request POST 'localhost:3000/v1/streams/%t/status?type=lost-connection'
on_camera_found /usr/bin/curl --location --request POST 'localhost:3000/v1/streams/%t/status?type=connection-ok'
```

Don't forget to:
* Create target dir of cameras.
* Change access `chmod` to target dir of cameras to add `+w` to user/group motion.

@see [motion-project](https://motion-project.github.io/motion_config.html)

### 2.4 Restart motion service

```bash
sudo service motion restart
```



## 3. Install motion ui
### 3.1 Install dependencies
Install the needed libraries and programs
* git
* nodejs  
* pm2

```bash
sudo apt-get install nodejs
sudo apt-get install git
npm install -g pm2
```

### 3.2 Get this project from github

```bash
get clone this repo
pm2 deploy ecosystem.config.js production setup
```

@see [pm2](https://pm2.keymetrics.io/docs/usage/deployment/)
### 3.3 Start motion ui

```bash
pm2 start motion-ui
```

## 4 Configure tasks

### 4.1 Configure logrotate for motion

Edit logrotate for motion add your own log file

```bash
/var/log/motion/motion.log
```

@see [logrotate](https://linux.die.net/man/8/logrotate)

@see [motion config](https://motion-project.github.io/motion_config.html#OptDetail_System_Processing)

### 4.2 Configure logrotate for pm2

```bash
pm2 install pm2-logrotate
```

@see [pm2-logrotate](https://github.com/keymetrics/pm2-logrotate#configure)
