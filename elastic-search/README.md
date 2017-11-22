
# ELASTIC SEARCH


Edit ESconf/elasticsearch.yaml to point to the paths of the data and the logfiles directories (tmp/data and tmp/log)

Then run Elastic search and the test python script with the following commands (path should be adapted to the local machine!):

/Users/Guida/GitHub/lime/elastic-search/bin/elasticsearch -Epath.conf=/Users/Guida/GitHub/lime/elastic-search/ESconf

cd ~/GitHub/lime/elastic-search
python3 elastic_test.py
