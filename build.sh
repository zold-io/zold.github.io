#!/bin/bash
set -x
set -e

target=$1
mkdir -p ${target}

cp html/*.html "${target}/"

mkdir -p "${target}/css"
for f in sass/*.sass; do
  name=${f##*/}
  base=${name%.*}
  sass --scss --sourcemap=none --load-path=sass "${f}" "${target}/css/${base}.css"
done

mkdir -p "${target}/images"
cp -R images/* "${target}/images"

mkdir -p "${target}/js"
cp -R js/*.js "${target}/js"
