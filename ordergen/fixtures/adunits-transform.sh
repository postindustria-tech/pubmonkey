# to paste ad units from the txt file list into the template
cat $1 | awk '{print $NF}' | grep "\S" | sed -E 's/(.*)/"\1",/' 