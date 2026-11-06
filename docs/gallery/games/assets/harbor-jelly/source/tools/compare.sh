#!/bin/sh
# compare.sh <reference-time-seconds> <our-shot.png> <out.png> : reference frame (cropped like ours) beside our screenshot
REF=../downloads/xiaohongshu_5kfUlgWpmeJ/video/p01.mp4
ffmpeg -v error -y -ss "$1" -i "$REF" -frames:v 1 -vf "scale=540:960" /tmp/hj_ref.png
ffmpeg -v error -y -i /tmp/hj_ref.png -i "$2" -filter_complex "[1]scale=540:960[b];[0][b]hstack" "$3"
