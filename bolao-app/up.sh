#!/bin/bash
git add .
read -p "Msg: " msg
git commit -m "$msg"
git push origin main
