# CockroachDB Cloud Pulumi Automation

This repository provides a convenience script to bootstrap and deploy three Pulumi projects 
(Basic, Standard, and Advanced Cockroach Cloud clusters) in AWS. So, no need to do these following steps as
the deployment script will:

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
*NOTE:*  This will deploy all three projects which is probably not what you want to do.  Look at the bottom of the script to see it has a for loop through all three subdirectories.  Make alterations here to do only a single folder.

1. **Run the script** to deploy all three projects under the `dev` stack:

   ```bash
   ./deployStack.sh
   ```

2. The script will:

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

## Deployment Script 
[deployStack.sh](deployStack.sh)


## Next Steps

After deployment, any updates to your `index.ts` files can be applied with:

```bash
cd <project-directory>
pulumi up
```

Script in pulumiAWSAdvanced can change the number of nodes in Advanced
[pulumiAWSAdvanced/resize.sh](resize.sh)
```bash
cd pulumiAWSAdvanced
# this will resize to 4 nodes
./resize.sh 4
```

To tear down a project:

```bash
cd <project-directory>
pulumi destroy --yes
pulumi stack rm dev --yes
```

---

Feel free to open issues or PRs for improvements!


