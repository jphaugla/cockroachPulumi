# CockroachDB Cloud Pulumi Automation

This repository provides a convenience script to bootstrap and deploy three Pulumi projects 
(Basic, Standard, and Advanced Cockroach Cloud clusters) in AWS. So, no need to do these following steps as
the script will:

1. Create project directories if they don’t exist.
2. Scaffold a minimal TypeScript Pulumi project (`Pulumi.yaml`, `index.ts`).
3. Install required npm packages (`@pulumi/pulumi` and `@pulumiverse/cockroach`).
4. Source your Cockroach Cloud API key.
5. Select or initialize a Pulumi stack.
6. Configure the `cockroach:apikey` secret.
7. Run `pulumi up --yes` to deploy without prompts.

## Prerequisites

* **Pulumi CLI**: installed and logged in (`pulumi login`).
* **Node.js & npm**: to install dependencies and run TypeScript.
  * on Mac, this can be done with homebrew
* **Cockroach Cloud API key**: stored and exported by your `~/.cockroachCloud/setEnv.sh` script, for example:

  ```bash
  export COCKROACH_API_KEY="<YOUR_KEY>"
  ```
* **AWS credentials**: configured in your environment (`aws configure` or environment variables).

## Directory Structure

Each of the three projects will be created/used under these directories:

* `pulumiAWSBasic`      – a BASIC (free-tier, serverless) cluster
* `pulumiAWSStandard`   – a STANDARD (paid, serverless) cluster
* `pulumiAWSAdvanced`   – an ADVANCED (pre-provisioned) cluster

Customize each folder’s `index.ts` as needed.

## Usage

1. **Make the deploy script executable** (if not already):

   ```bash
   chmod +x deploy.sh
   ```

2. **Run the script** to deploy all three projects under the `dev` stack:

   ```bash
   ./deploy.sh
   ```

3. The script will:

  * Create or reuse the `dev` stack
  * Install dependencies
  * Configure secrets
  * Preview and apply updates

## Customization

* **Stack name**: by default the script uses `dev`. Change the `STACK_NAME` variable in `deploy.sh` to override.
* **Cockroach Cloud folder**: change the folder path in each `index.ts` (passed to `cockroach.getFolderOutput`) or set via config:

  ```bash
  pulumi config set parentFolderId "<YOUR_FOLDER_ID>"
  ```
* **Adding projects**: add directory names to the final loop in `deploy.sh`.

## Script (`deploy.sh`)

```bash
#!/usr/bin/env bash
set -euo pipefail

# Change this if you use a different stack
STACK_NAME="dev"

deploy_project() {
  local DIRNAME=$1

  # 1. Create and enter the project directory
  mkdir -p "${DIRNAME}"
  cd "${DIRNAME}"

  # 2. Scaffold a minimal TypeScript Pulumi project if missing
  if [ ! -f Pulumi.yaml ]; then
    pulumi new typescript --generate-only --force --yes \
      --name "${DIRNAME}" \
      --description "Pulumi project for ${DIRNAME}"
  fi

  # 3. Install Pulumi & Cockroach provider packages
  npm install @pulumi/pulumi @pulumiverse/cockroach

  # 4. Load your Cockroach Cloud API Key
  source ~/.cockroachCloud/setEnv.sh

  # 5. Select or create the 'dev' stack
  if ! pulumi stack select "${STACK_NAME}" 2>/dev/null; then
    pulumi stack init "${STACK_NAME}"
  fi

  # 6. Configure the Cockroach API key
  pulumi config set --secret cockroach:apikey "$COCKROACH_API_KEY"

  # (Optional) target a specific Cockroach Cloud folder by ID:
  # pulumi config set parentFolderId "<YOUR_FOLDER_ID>"

  # 7. Deploy without interactive prompts
  pulumi up --yes

  # Return to the parent directory
  cd -
}

# Deploy all three variants
for PROJECT in pulumiAWSBasic pulumiAWSStandard pulumiAWSAdvanced; do
  deploy_project "$PROJECT"
done
```

## Next Steps

After deployment, any updates to your `index.ts` files can be applied with:

```bash
cd <project-directory>
pulumi up
```

To tear down a project:

```bash
cd <project-directory>
pulumi destroy --yes
pulumi stack rm dev --yes
```

---

Feel free to open issues or PRs for improvements!


