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
const basicCluster = new cockroach.Cluster("basicCluster", {
    name:            "jph-basic-cluster",
    cloudProvider:   "AWS",
    plan:            "BASIC",
    serverless: {
        usageLimits: {
          requestUnitLimit:  50000000,  // 50 million RUs per month
          storageMibLimit:   10240,     // 10 GiB
        },
    },
    regions: [{
        name:    "us-east-1",
        primary: true,
    }],
    parentId:        parentId,     // now an Output<string> guaranteed to be defined
    deleteProtection: false,
}, { provider });

// 6. Export IDs and DNS endpoints
export const clusterId   = basicCluster.id;
export const sqlEndpoint = basicCluster.regions.apply(r => r[0].sqlDns);
export const uiEndpoint  = basicCluster.regions.apply(r => r[0].uiDns);

