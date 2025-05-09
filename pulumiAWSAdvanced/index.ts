import * as pulumi from "@pulumi/pulumi";
import * as cockroach from "@pulumiverse/cockroach";

// 1. Load your Cockroach API key from Pulumi config
const cfg    = new pulumi.Config("cockroach");
const apikey = cfg.requireSecret("apikey");
const clusterCfg = new pulumi.Config("cluster");
const nodeCount  = clusterCfg.requireNumber("nodeCount");
const numVirtualCpus  = clusterCfg.requireNumber("numVirtualCpus");

// 2. Create the Cockroach provider (all-lowercase “apikey”)
const provider = new cockroach.Provider("cockroach", {
    apikey: apikey,
});

// 3. Lookup your folder by path (returns an Output<GetFolderResult>)
const folder = cockroach.getFolderOutput({ path: "/Jphaugla" });

// 4. Extract & validate the folder ID in one go
const parentId = folder.apply(f => {
    if (!f.id) {
        throw new Error("Folder ‘/Jphaugla’ not found or has no ID");
    }
    return f.id;
});

// 5. Create an ADVANCED (pre-provisioned) cluster under that folder
const fixedCluster = new cockroach.Cluster("fixedCluster", {
    name:            "jph-advanced-cluster",
    cloudProvider:   "AWS",
    plan:            "ADVANCED",            // ADVANCED supports dedicated nodes
    dedicated: {
        numVirtualCpus,                     // number of vCPUs per node
        storageGib:     64,                 // 64 GiB disk per node
    },
    regions: [{
        name:      "us-east-1",
        nodeCount,                       // 3 nodes in this region
    }],
    parentId:        parentId,              // <-- here’s the variable we declared above
    deleteProtection: false,
}, { provider });                           // <-- here’s the provider we declared above

// 6. Export cluster info
export const clusterId   = fixedCluster.id;
export const sqlEndpoint = fixedCluster.regions.apply(r => r[0].sqlDns);
export const uiEndpoint  = fixedCluster.regions.apply(r => r[0].uiDns);

