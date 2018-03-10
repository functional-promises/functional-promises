#!/bin/bash

printf '# REPORT: COUNT LINES-OF-CODE\n\n' | tee stats-loc.yml

printf '# (measures original source files)\n' | tee -a stats-loc.yml

printf "# CREATED: $(date +%F)\\n" | tee -a stats-loc.yml

printf '\n\n# FUNCTIONAL PROMISE:' | tee -a stats-loc.yml
cloc --quiet --yaml src | tee -a stats-loc.yml
printf '\n\n# RxJS:' | tee -a stats-loc.yml
cloc --quiet --yaml ../RxJS/src | tee -a stats-loc.yml
printf '\n\n# IxJS:' | tee -a stats-loc.yml
cloc --quiet --yaml ../IxJS/src | tee -a stats-loc.yml
printf '\n\n# Bluebird:' | tee -a stats-loc.yml
cloc --quiet --yaml ../bluebird/src | tee -a stats-loc.yml
