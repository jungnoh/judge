#!/bin/bash
cd src_build
echo Building src_build files..
for i in *
do
  echo -e "Building src_build/\033[0;34m$i\033[0m.."
  g++ $i -o ../build/$i -O2
  a=$?
  if [ $a -eq 0 ]; then
    echo -e "$(tput setaf 2)$(tput bold)Building $i succeeded"
  else
    echo -e "$(tput setaf 1)$(tput bold)Building $i failed"
  fi
done
cd ../src_run
echo Building src_run files..
for i in *
do
  echo -e "Building src_run/\033[0;34m$i\033[0m.."
  g++ $i -o ../run/$i -O2
  a=$?
  if [ $a -eq 0 ]; then
    echo -e "$(tput setaf 2)$(tput bold)Building $i succeeded"
  else
    echo -e "$(tput setaf 1)$(tput bold)Building $i failed"
  fi
done
cd ..
