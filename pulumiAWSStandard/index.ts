import * as pulumi from "@pulumi/pulumi";
import * as cockroach from "@pulumiverse/cockroach";

// 1. Load your Cockroach API key from Pulumi config
const cfg    = new pulumi.Config("cockroach");
const apikey = cfg.requireSecret("apikey");

// 2. Create the Cockroach provider (lowercase `apikey`)
const provider = new cockroach.Provider("cockroach", {
    apikey: apikey,
});

// 3. Lookup your folder by path (Output<GetFolderResult>)
const folder = cockroach.getFolderOutput({ path: "/Jphaugla" });

// 4. Extract & validate the folder ID in one go
const parentId = folder.apply(f => {
    if (!f.id) {
        throw new Error("Folder ‘/Jphaugla’ not found or has no ID");
    }
    return f.id;
});

// 5. Create the Basic serverless cluster under that folder
const standardCluster = new cockroach.Cluster("standardCluster", {
    name:            "jph-standard-cluster",
    cloudProvider:   "AWS",
    plan:            "STANDARD",
    serverless: {
        usageLimits: {
          provisionedVirtualCpus: 12,
        },
     upgradeType: "AUTOMATIC",
    },
    regions: [{
        name:    "us-east-1",
        primary: true,
    }],
    parentId:        parentId,     // now an Output<string> guaranteed to be defined
    deleteProtection: false,
}, { provider });

// 6. Export IDs and DNS endpoints
export const clusterId   = standardCluster.id;
export const sqlEndpoint = standardCluster.regions.apply(r => r[0].sqlDns);
export const uiEndpoint  = standardCluster.regions.apply(r => r[0].uiDns);

