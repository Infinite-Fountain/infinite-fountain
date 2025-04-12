// root/src/app/pools-manager/page.tsx
"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";

const ALCHEMY_API_URL = process.env.NEXT_PUBLIC_ALCHEMY_API_URL;

const BatchAssign = () => {
  // Pool contract address input.
  const [poolAddress, setPoolAddress] = useState("");
  // Array of rows for assignments: each row includes recipient, amount, tag, and concept.
  const [rows, setRows] = useState([
    { recipient: "", amount: "", tag: "", concept: "" }
  ]);
  // Inputs for "fill all tags and concepts"
  const [globalTag, setGlobalTag] = useState("");
  const [globalConcept, setGlobalConcept] = useState("");
  
  // Status message for UI feedback.
  const [status, setStatus] = useState("");

  // Add a new row.
  const addRow = () => {
    setRows([...rows, { recipient: "", amount: "", tag: "", concept: "" }]);
  };

  // Update a specific row field.
  const updateRow = (index: number, key: keyof typeof rows[0], value: string) => {
    const newRows = [...rows];
    newRows[index][key] = value;
    setRows(newRows);
  };

  // "Fill All Rows" handler: populate each row's tag and concept with globalTag and globalConcept.
  const fillAllRows = () => {
    const newRows = rows.map(row => ({
      ...row,
      tag: globalTag,
      concept: globalConcept
    }));
    setRows(newRows);
  };

  // Batch assign function to call the smart contract.
  const handleBatchAssign = async () => {
    setStatus("Preparing transaction...");
    try {
      if (!ethers.utils.isAddress(poolAddress)) {
        setStatus("Invalid pool contract address");
        return;
      }

      // Request accounts through MetaMask
      if (!window.ethereum) {
        setStatus("MetaMask is required");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // Create contract instance
      const contract = new ethers.Contract(poolAddress, abi, signer);

      // Prepare parallel arrays: recipients, amounts, tags, concepts.
      const recipients: string[] = [];
      const amounts: ethers.BigNumber[] = [];
      const tags: string[] = [];
      const concepts: string[] = [];

      // Iterate over rows and include only valid rows.
      rows.forEach(row => {
        if (row.recipient && row.amount && ethers.utils.isAddress(row.recipient)) {
          recipients.push(row.recipient);
          // Assume the amount is provided in USDC units (6 decimals).
          amounts.push(ethers.utils.parseUnits(row.amount, 6));
          tags.push(row.tag);
          concepts.push(row.concept);
        }
      });

      if (recipients.length === 0) {
        setStatus("No valid rows to assign.");
        return;
      }

      setStatus("Sending transaction...");
      const tx = await contract.assignCommunityUSDC(
        recipients,
        amounts,
        tags,
        concepts
      );
      setStatus("Transaction sent. Awaiting confirmation...");
      await tx.wait();
      setStatus("Batch assignment successful!");
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    }
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "white", color: "black" }}>
      <h2>Batch Assign Community USDC (CT)</h2>
      
      <div>
        <label>
          Pool Contract Address:{" "}
          <input
            type="text"
            value={poolAddress}
            onChange={(e) => setPoolAddress(e.target.value)}
            placeholder="Enter pool contract address"
            style={{ width: "400px" }}
          />
        </label>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <h3>Assignments</h3>
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>Recipient</th>
              <th>Amount (USDC)</th>
              <th>Tag</th>
              <th>Concept</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={row.recipient}
                    onChange={(e) => updateRow(index, "recipient", e.target.value)}
                    placeholder="Recipient Address"
                    style={{ width: "300px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => updateRow(index, "amount", e.target.value)}
                    placeholder="Amount"
                    style={{ width: "120px" }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.tag}
                    onChange={(e) => updateRow(index, "tag", e.target.value)}
                    placeholder="Tag"
                    style={{ width: "150px" }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.concept}
                    onChange={(e) => updateRow(index, "concept", e.target.value)}
                    placeholder="Concept"
                    style={{ width: "150px" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addRow} style={{ marginTop: "1rem" }}>
          Add New Row
        </button>
      </div>
      
      <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc" }}>
        <h3>Fill All Tags and Concepts</h3>
        <div>
          <label>
            Global Tag:{" "}
            <input
              type="text"
              value={globalTag}
              onChange={(e) => setGlobalTag(e.target.value)}
              placeholder="Global Tag"
              style={{ width: "200px" }}
            />
          </label>
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <label>
            Global Concept:{" "}
            <input
              type="text"
              value={globalConcept}
              onChange={(e) => setGlobalConcept(e.target.value)}
              placeholder="Global Concept"
              style={{ width: "200px" }}
            />
          </label>
        </div>
        <button onClick={fillAllRows} style={{ marginTop: "1rem" }}>
          Fill All Rows
        </button>
      </div>
      
      <div style={{ marginTop: "2rem" }}>
        <button onClick={handleBatchAssign} style={{ padding: "0.5rem 1rem", fontSize: "16px" }}>
          Batch Assign
        </button>
      </div>
      
      <div style={{ marginTop: "1rem", color: "blue" }}>
        <strong>Status:</strong> {status}
      </div>
    </div>
  );
};

export default BatchAssign;
