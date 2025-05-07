#!/usr/bin/env bash
set -euo pipefail

# Change this if you use a different stack
STACK_NAME="dev"

deploy_project() {
  local DIRNAME=$1

  # 1. Create and enter the project directory
  mkdir -p "${DIRNAME}"
  cd "${DIRNAME}"

  # 2. If there's no Pulumi.yaml, scaffold a barebones TS project
  if [ ! -f Pulumi.yaml ]; then
    pulumi new typescript --generate-only --force --yes \
      --name "${DIRNAME}" \
      --description "Pulumi project for ${DIRNAME}"
  fi

  # 3. Install your Pulumi & Cockroach provider packages
  npm install @pulumi/pulumi @pulumiverse/cockroach

  # 4. Load your Cockroach Cloud API Key
  source ~/.cockroachCloud/setEnv.sh

  # 5. Select or create the 'dev' stack
  if ! pulumi stack select "${STACK_NAME}" 2>/dev/null; then
    pulumi stack init "${STACK_NAME}"
  fi

  # 6. Configure the Cockroach API key
  pulumi config set --secret cockroach:apikey "$COCKROACH_API_KEY"

  # (Optional) If you need to target a folder by ID:
  # pulumi config set parentFolderId "<YOUR_FOLDER_ID>"

  # 7. Deploy without interactive prompts
  pulumi up --yes

  # Return to caller
  cd -
}

# Run it for each variant
for PROJECT in pulumiAWSBasic pulumiAWSStandard pulumiAWSAdvanced; do
  deploy_project "$PROJECT"
done

