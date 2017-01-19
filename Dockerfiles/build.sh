#!/bin/bash
if [[ $EUID -ne 0 ]]; then
  echo "This script must be run by root" 1>&2
  exit 1
fi
for i in *
do
  if test -d $i
  then
    echo -e "Building \033[0;34m$i\033[0m.."
    (docker build --tag=$i $(pwd)/$i)
    a=$? 
    if [ $a -eq 0 ]; then
      echo -e "$(tput setaf 2)$(tput bold)Building $i succeeded" 
    else
      echo -e "$(tput setaf 1)$(tput bold)Building $i failed, consult log"
    fi
  fi
done
echo -e "\033[0m<Build commands>"
for i in *build
do
  echo "$i: $(cat $i/build_command.txt)"
done
echo -e "\033[0m<Run commands>"
for i in *run
do
  echo "$i: $(cat $i/build_command.txt)"
done
