FROM ubuntu:16.04
MAINTAINER studio.h <studiodoth@protonmail.com>
RUN apt update -y;
RUN apt install -y g++ vim;
RUN mkdir workspace
WORKDIR /workspace
COPY main.c main.c
RUN gcc main.c -o runner -O2 -v -da -Q -g
RUN rm main.c
