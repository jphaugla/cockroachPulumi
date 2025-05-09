#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<EOF >&2
Usage: $(basename "$0") NUM_NODES NUM_CPUS

  NUM_NODES   – desired number of CockroachDB nodes (positive integer)
  NUM_CPUS    – vCPUs per node (positive integer)

Example:
  $(basename "$0") 3 4
EOF
  exit 1
}

# 1) Check we got exactly two args
if [ "$#" -ne 2 ]; then
  echo "Error: Wrong number of arguments." >&2
  usage
fi

NUM_NODES=$1
NUM_CPUS=$2

# 2) Validate NUM_NODES is a positive integer
if ! [[ "$NUM_NODES" =~ ^[1-9][0-9]*$ ]]; then
  echo "Error: NUM_NODES ('$NUM_NODES') must be a positive integer." >&2
  usage
fi

# 3) Validate NUM_CPUS is a positive integer
if ! [[ "$NUM_CPUS" =~ ^[1-9][0-9]*$ ]]; then
  echo "Error: NUM_CPUS ('$NUM_CPUS') must be a positive integer." >&2
  usage
fi

# 4) Apply the Pulumi config
pulumi config set cluster:nodeCount      "$NUM_NODES"
pulumi config set cluster:numVirtualCpus "$NUM_CPUS"

# 5) Deploy
pulumi up --yes

