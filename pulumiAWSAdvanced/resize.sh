NUM_NODES=$1
pulumi config set cluster:nodeCount $NUM_NODES
pulumi up
