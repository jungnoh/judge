#!/bin/bash
echo -e "Enter MySQL root password: \c "
read -s password
sudo apt update
sudo apt upgrade
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password '"$password"
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password '"$password"
sudo apt install -y --no-install-recommends git vim nodejs nodejs-legacy npm apt-transport-https ca-certificates curl software-properties-common redis-server mysql-server
curl -fsSL https://apt.dockerproject.org/gpg | sudo apt-key add -
sudo add-apt-repository \
       "deb https://apt.dockerproject.org/repo/ \
       ubuntu-$(lsb_release -cs) \
       main"
sudo apt update
sudo apt install -y docker-engine
git clone https://github.com/studiodoth/judge
cd judge
mkdir data-removed cases judge_tmp usercode
mysql -uroot -p"$password" < setup_db.sql
cd front
cwd
#sudo npm install --prefix ./front/node_modules
#sudo npm install -g n
#sudo n stable
#sudo npm rebuild
cd ..
cd ..
cd Dockerfiles
sudo bash build.sh
echo 'All done!'
