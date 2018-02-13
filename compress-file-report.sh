#!/bin/bash
input_file=${1:-dist/bundle.min.js}
output_mode=${2:-yaml}

if [ ! -f "$input_file" ]; then
  if [ -f "$output_mode" ]; then
    ## Found reversed args, switch them
    tfile=$output_mode
    output_mode=$input_file
    input_file=$tfile
  fi
fi

if [ "$output_mode" == "yml" ]; then
  output_mode=yaml
fi


function compress {
  gzip --force --keep --best --suffix '.gz' $input_file
  brotli --best -kf $input_file
}

function printYaml {
  printf "compressed_file: $input_file\n"
  printf "    original: $(stat --format %s $input_file)\n"
  printf "    gzipped:  $(stat --format %s $input_file.gz)\n"
  printf "    brotli:   $(stat --format %s $input_file.br)\n"
}

function printMarkdown {
  printf "### \`$input_file\` Compression Results \n"
  printf "| Utility     | File Size   |\n"
  printf "|-------------|------------:|\n"
  printf "| _original_  | $(stat --format %s $input_file)\n"
  printf "| gzip        | $(stat --format %s $input_file.gz)\n"
  printf "| brotli      | $(stat --format %s $input_file.br)\n"
}



compress

if [ "$output_mode" == "yaml" ]; then
  printYaml
fi

if [ "$output_mode" != "yaml" ]; then
  printMarkdown
fi

# printYaml | sed 's/:/  \|  /' | sed 's/^/\|/'
