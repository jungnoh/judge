FROM ubuntu:16.04
MAINTAINER studio.h <studiodoth@protonmail.com>
RUN apt update -y;
RUN apt install -y g++ vim;
RUN mkdir workspace
WORKDIR /workspace
COPY main.cpp main.cpp
RUN g++ main.cpp -o runner -O2 -Wall --static
RUN rm main.cpp
