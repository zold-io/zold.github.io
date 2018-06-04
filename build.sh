#!/bin/bash
set -x
set -e

target=$1
mkdir -p ${target}

cp html/*.html "${target}/"
mkdir -p "${target}/css"
sass --scss sass/*.sass "${target}/css/main.css"
mkdir -p "${target}/images"
cp -R images/* "${target}/images"
