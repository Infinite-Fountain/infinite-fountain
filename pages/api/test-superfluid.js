// pages/api/test-superfluid.js

import fetch from 'node-fetch'; // Ensure node-fetch is installed

// Hardcoded configuration values for testing on Base mainnet using the docs endpoint
const config = {
  url: "https://subgraph-endpoints.superfluid.dev/base-mainnet/protocol-v1",
  poolId: "0xcfdb8387d476a44641eb823983c034bb259380a0",
  query: `
    query ($id: ID!) {
      pool(id: $id) {
        totalAmountDistributedUntilUpdatedAt
      }
    }
  `,
  style: {
    positionX: "30%",
    positionY: "50%",
    background: "white",
    fontColor: "black",
    fontSize: "16px"
  }
};

export default async function handler(req, res) {
  // Ensure the pool id is in lowercase
  const lowerCasePoolId = config.poolId.toLowerCase();
  const dynamicQuery = config.query;
  const variables = { id: lowerCasePoolId };

  console.log("Variables being sent:", variables);
  console.log("Sending POST request to:", config.url);
  console.log("Dynamic Query:", dynamicQuery);

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        query: dynamicQuery,
        variables
      })
    });

    console.log("HTTP Status:", response.status);
    const text = await response.text();
    console.log("Raw response text:", text);

    if (!text) {
      console.error("Empty response body");
      return res.status(500).json({ error: "Empty response from subgraph" });
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse JSON:", err);
      return res.status(500).json({ error: "Failed to parse JSON response", raw: text });
    }
    console.log("Parsed response JSON:", json);

    const pool = json.data ? json.data.pool : null;
    const resultValue = pool ? pool.totalAmountDistributedUntilUpdatedAt : 'N/A';
    res.status(200).json([{ result: resultValue, style: config.style }]);
  } catch (error) {
    console.error("Error querying Superfluid subgraph:", error);
    res.status(500).json({ error: "Error fetching subgraph data" });
  }
}
