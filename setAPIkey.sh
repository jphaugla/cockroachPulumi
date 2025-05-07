DIRNAME=pulumiAWSAdvanced
mkdir ${DIRNAME}
cd ${DIRNAME}
# this is only needed for creating a new directory
# pulumi new typescript
npm install @pulumi/pulumi @pulumiverse/cockroach
source ~/.cockroachCloud/setEnv.sh
pulumi config set --secret cockroach:apikey "$COCKROACH_API_KEY"
pulumi up
