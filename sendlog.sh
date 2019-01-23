#!/bin/bash
name="gpu server name"
endpoint="https://asia-northeast1-${PROJECT_NAME}.cloudfunctions.net/storeFirebase"

gpu=`nvidia-smi --query-gpu=name,utilization.gpu,utilization.memory,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits`

process=`nvidia-smi --query-compute-apps=pid,name,used_memory --format=csv,noheader,nounits | sed 's/, / /g' | sed ':a;N;$!ba;s/\n/,/g'`

cpuUtil=`echo $[100-$(vmstat 1 2|tail -1|awk '{print $15}')]`
mem=`free -m | tr '\n' ',' | cut -d, -f2 | sed 's/[\t ]\+/ /g' | cut -d' ' -f2,3`
memTotal=`echo $mem | cut -d' ' -f1`
memUsed=`echo $mem | cut -d' ' -f2`
memUtil=`echo "scale=5; $memUsed / $memTotal * 100" | bc | awk '{printf ("%.2f\n", $1)}'`
cpu="$name,$cpuUtil,$memUtil,$memTotal"

curl $endpoint -X POST -H "Content-Type: application/json" --data-binary '{"cpu": "'"${cpu}"'", "gpu": "'"${gpu}"'", "process": "'"${process}"'"}' > /dev/null 2>&1
