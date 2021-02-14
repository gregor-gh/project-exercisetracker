const config = {
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY,
    databaseId: "FreeCodeCamp",
    containerId: "ExerciseTracker",
    partitionKey: {kind: "Hash", paths: ["/username"]}
  };

  module.exports = config;