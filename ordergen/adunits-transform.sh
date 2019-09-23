# to paste ad units from the txt file list into the template
SED_EXPR='s/.*\([a-f0-9]\{32\}\)/"\1",/'
cat $1 | grep 320x50 | sed $SED_EXPR
cat $1 | grep 728x90 | sed $SED_EXPR