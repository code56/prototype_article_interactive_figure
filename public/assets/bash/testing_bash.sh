#!/bin/bash

echo "Working hard..."

# writing the state line
#echo  # an empty line here so the next line will be the last.
echo "changed=yes comment='something has changed' whatever=123"

if [ -f /srv/node-web-server/public/assets/bash/default_metadata.txt ] 
then
	if [ -s /srv/node-web-server/public/assets/bash/default_metadata.txt ]
	then
		echo "found default_metadata file"
	else
		echo "file exists but not empty"
	fi
else
	echo "File not exists"
	wget https://www.dropbox.com/sh/n15tpsqj92wfn8u/AACeafgJTWNTG2pos0EBSioOa/IWGSC1/default_metadata.txt




#wget https://www.dropbox.com/sh/n15tpsqj92wfn8u/AAA7-GaMgxEgzs_dAgfwdpwca/IWGSC1/FactorOrder.tsv






# mkdir -p /srv/formulas
# cd /srv/formulas
# git clone https://github.com/saltstack-formulas/apache-formula.git

# # or

# mkdir -p /srv/formulas
# cd /srv/formulas
# wget https://github.com/saltstack-formulas/apache-formula/archive/master.tar.gz
# tar xf apache-formula-master.tar.gz