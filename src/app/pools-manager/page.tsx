// root/src/app/pools-manager/page.tsx
"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";

const ALCHEMY_API_URL = process.env.NEXT_PUBLIC_ALCHEMY_API_URL;

type Row = {
  recipient: string;
  amount: string;
  tag: string;
  concept: string;
};

type Holder = {
  holder: string;
  balance: string;
};

const PoolsManager: React.FC = () => {
  // Global pool contract address state.
  const [poolAddress, setPoolAddress] = useState<string>("");
  // Dashboard state.
  const [totalPoolBalance, setTotalPoolBalance] = useState<string>("");
  const [totalAssigned, setTotalAssigned] = useState<string>("");
  const [totalUnassigned, setTotalUnassigned] = useState<string>("");
  const [dashboardHolders, setDashboardHolders] = useState<Holder[]>([]);
  const [dashboardStatus, setDashboardStatus] = useState<string>("");
  // Control whether the dashboard (with all subsequent sections) is expanded.
  const [showDashboard, setShowDashboard] = useState<boolean>(false);

  // Batch assignment rows.
  const [rows, setRows] = useState<Row[]>([
    { recipient: "", amount: "", tag: "", concept: "" }
  ]);
  // Global fill values.
  const [globalTag, setGlobalTag] = useState<string>("");
  const [globalConcept, setGlobalConcept] = useState<string>("");
  // Status message for on-chain actions.
  const [status, setStatus] = useState<string>("");

  // Additional state for external transfer inputs.
  const [extTransferRecipient, setExtTransferRecipient] = useState<string>("");
  const [extTransferAmount, setExtTransferAmount] = useState<string>("");
  const [extTransferTag, setExtTransferTag] = useState<string>("");
  const [extTransferConcept, setExtTransferConcept] = useState<string>("");

  // Additional state for deposit inputs.
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositTag, setDepositTag] = useState<string>("");
  const [depositConcept, setDepositConcept] = useState<string>("");

  // Handler: add a new row.
  const addRow = () => {
    setRows([...rows, { recipient: "", amount: "", tag: "", concept: "" }]);
  };

  // Handler: update a given row field.
  const updateRow = (index: number, key: keyof Row, value: string) => {
    const newRows = [...rows];
    newRows[index][key] = value;
    setRows(newRows);
  };

  // Handler: fill all rows' tag and concept with global values.
  const fillAllRows = () => {
    const updatedRows = rows.map((row) => ({
      ...row,
      tag: globalTag,
      concept: globalConcept,
    }));
    setRows(updatedRows);
  };

  // Dashboard: fetch data from contract.
  const handleSeeDashboard = async () => {
    setDashboardStatus("Loading dashboard...");
    try {
      if (!poolAddress || !ethers.utils.isAddress(poolAddress)) {
        setDashboardStatus("Invalid pool contract address");
        return;
      }
      if (!window.ethereum) {
        setDashboardStatus("MetaMask is required");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      
      // Create contract instance.
      const contract = new ethers.Contract(poolAddress, abi, signer);
      
      // Check if current wallet is the owner.
      const currentAddress = (await signer.getAddress()).toLowerCase();
      const contractOwner = (await contract.owner()).toLowerCase();
      if (currentAddress !== contractOwner) {
        alert("your wallet is not the owner");
        setDashboardStatus("Dashboard load aborted: wallet is not the owner.");
        return;
      }
      
      const poolBal = await contract.totalPoolBalance();
      const assigned = await contract.totalAssigned();
      const unassigned = await contract.getUnassignedPoolBalance();
      const holders = await contract.getHolderListWithBalance();
      
      setTotalPoolBalance(ethers.utils.formatUnits(poolBal, 6));
      setTotalAssigned(ethers.utils.formatUnits(assigned, 6));
      setTotalUnassigned(ethers.utils.formatUnits(unassigned, 6));
      
      const holderListWithBalance: Holder[] = holders.map((h: any) => ({
        holder: h.holder,
        balance: ethers.utils.formatUnits(h.balance, 6),
      }));
      setDashboardHolders(holderListWithBalance);
      setDashboardStatus("Dashboard loaded.");
      setShowDashboard(true);
    } catch (error: any) {
      console.error(error);
      setDashboardStatus(`Error: ${error.message}`);
      setShowDashboard(false);
    }
  };

  // Batch assign function.
  const handleBatchAssign = async () => {
    setStatus("Preparing transaction...");
    try {
      if (!poolAddress || !ethers.utils.isAddress(poolAddress)) {
        setStatus("Invalid pool contract address");
        return;
      }
      if (!window.ethereum) {
        setStatus("MetaMask is required");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      
      const contract = new ethers.Contract(poolAddress, abi, signer);

      // Check if current wallet is the owner.
      const currentAddress = (await signer.getAddress()).toLowerCase();
      const contractOwner = (await contract.owner()).toLowerCase();
      if (currentAddress !== contractOwner) {
        alert("your wallet is not the owner");
        setStatus("Batch assignment aborted: wallet is not the owner.");
        return;
      }
      
      const recipients: string[] = [];
      const amounts: ethers.BigNumber[] = [];
      const tags: string[] = [];
      const concepts: string[] = [];
      
      rows.forEach(row => {
        if (row.recipient && row.amount && ethers.utils.isAddress(row.recipient)) {
          recipients.push(row.recipient);
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
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  // Batch unassign function.
  const handleBatchUnassign = async () => {
    setStatus("Preparing unassignment transaction...");
    try {
      if (!poolAddress || !ethers.utils.isAddress(poolAddress)) {
        setStatus("Invalid pool contract address");
        return;
      }
      if (!window.ethereum) {
        setStatus("MetaMask is required");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      
      const contract = new ethers.Contract(poolAddress, abi, signer);

      // Check if current wallet is the owner.
      const currentAddress = (await signer.getAddress()).toLowerCase();
      const contractOwner = (await contract.owner()).toLowerCase();
      if (currentAddress !== contractOwner) {
        alert("your wallet is not the owner");
        setStatus("Batch unassignment aborted: wallet is not the owner.");
        return;
      }
      
      const recipients: string[] = [];
      const amounts: ethers.BigNumber[] = [];
      const tags: string[] = [];
      const concepts: string[] = [];
      
      rows.forEach(row => {
        if (row.recipient && row.amount && ethers.utils.isAddress(row.recipient)) {
          recipients.push(row.recipient);
          amounts.push(ethers.utils.parseUnits(row.amount, 6));
          tags.push(row.tag);
          concepts.push(row.concept);
        }
      });
      
      if (recipients.length === 0) {
        setStatus("No valid rows to unassign.");
        return;
      }
      
      setStatus("Sending unassignment transaction...");
      const tx = await contract.unAssignCommunityUSDC(
        recipients,
        amounts,
        tags,
        concepts
      );
      setStatus("Transaction sent. Awaiting confirmation...");
      await tx.wait();
      setStatus("Batch unassignment successful!");
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  // External Transfer function.
  const handleExternalTransfer = async () => {
    setStatus("Preparing external transfer...");
    try {
      if (!poolAddress || !ethers.utils.isAddress(poolAddress)) {
        setStatus("Invalid pool contract address");
        return;
      }
      if (!window.ethereum) {
        setStatus("MetaMask is required");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      
      const contract = new ethers.Contract(poolAddress, abi, signer);

      // Check if current wallet is the owner.
      const currentAddress = (await signer.getAddress()).toLowerCase();
      const contractOwner = (await contract.owner()).toLowerCase();
      if (currentAddress !== contractOwner) {
        alert("your wallet is not the owner");
        setStatus("External transfer aborted: wallet is not the owner.");
        return;
      }

      // Validate the external transfer input.
      if (!ethers.utils.isAddress(extTransferRecipient)) {
        setStatus("Invalid recipient address for external transfer.");
        return;
      }
      if (!extTransferAmount) {
        setStatus("Please enter an amount for external transfer.");
        return;
      }

      setStatus("Sending external transfer transaction...");
      const tx = await contract.externalTransfer(
        extTransferRecipient,
        ethers.utils.parseUnits(extTransferAmount, 6),
        extTransferTag,
        extTransferConcept
      );
      setStatus("External transfer transaction sent. Awaiting confirmation...");
      await tx.wait();
      setStatus("External transfer successful!");
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  // Deposit function.
  const handleDeposit = async () => {
    setStatus("Preparing deposit...");
    try {
      if (!poolAddress || !ethers.utils.isAddress(poolAddress)) {
        setStatus("Invalid pool contract address");
        return;
      }
      if (!window.ethereum) {
        setStatus("MetaMask is required");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      
      const contract = new ethers.Contract(poolAddress, abi, signer);
      
      if (!depositAmount) {
        setStatus("Please enter an amount for deposit.");
        return;
      }
      
      setStatus("Sending deposit transaction...");
      const tx = await contract.depositUSDC(
        ethers.utils.parseUnits(depositAmount, 6),
        depositTag,
        depositConcept
      );
      setStatus("Deposit transaction sent. Awaiting confirmation...");
      await tx.wait();
      setStatus("Deposit successful!");
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{
      padding: "2rem",
      backgroundColor: "white",
      color: "black",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      overflowY: "auto",
      maxHeight: "100vh"
    }}>
      {/* Global Section: Pool Contract Address & Dashboard Trigger */}
      <details style={{ width: "100%", marginBottom: "2rem" }}>
        <summary style={{
          cursor: "default",
          fontSize: "1.2rem",
          marginBottom: "1rem",
          borderBottom: "3px solid #333",
          paddingBottom: "1.5rem"
        }}>
          Pool Contract Address
        </summary>
        <section style={{ width: "100%" }}>
          <h1>Pools Manager</h1>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <label>
              <strong>Pool Contract Address:</strong>{" "}
              <input
                type="text"
                value={poolAddress}
                onChange={(e) => setPoolAddress(e.target.value)}
                placeholder="Enter pool contract address"
                style={{ width: "400px" }}
              />
            </label>
            <button
              onClick={handleSeeDashboard}
              style={{ padding: "0.5rem 1rem", backgroundColor: "#007ACC", color: "white", fontSize: "16px" }}
            >
              See Dashboard
            </button>
          </div>
          {dashboardStatus && (
            <div style={{ marginTop: "1rem", fontStyle: "italic" }}>
              {dashboardStatus}
            </div>
          )}
          {showDashboard && (
            <div style={{ marginTop: "1rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <div><strong>Total Pool Balance:</strong> {totalPoolBalance} USDC</div>
                <div><strong>Total Unassigned:</strong> {totalUnassigned} USDC</div>
                <div><strong>Total Assigned:</strong> {totalAssigned} USDC</div>
              </div>
              <div>
                <h3>Pool Members</h3>
                <table border={1} cellPadding={8}>
                  <thead>
                    <tr>
                      <th>Address</th>
                      <th>Balance (USDC)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardHolders.map((holder, index) => (
                      <tr key={index}>
                        <td>{holder.holder}</td>
                        <td>{holder.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </details>

      {showDashboard && (
        <details style={{ width: "100%" }}>
          <summary style={{ cursor: "default", fontSize: "1.2rem", marginBottom: "1rem" }}>
            Dashboard & Management Panels
          </summary>
          {/* Section: Batch Assign Community USDC (CT) */}
          <details style={{ width: "100%", marginBottom: "2rem" }}>
            <summary style={{ cursor: "default", fontSize: "1.2rem", marginBottom: "1rem" }}>
              Batch Assign Community USDC (CT)
            </summary>
            <section style={{ width: "100%" }}>
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
            </section>
            <section style={{ marginBottom: "2rem", width: "100%", padding: "1rem", border: "1px solid #ccc" }}>
              <h3>Fill All Tags and Concepts</h3>
              <div style={{ marginBottom: "0.5rem" }}>
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
              <div style={{ marginBottom: "0.5rem" }}>
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
              <button onClick={fillAllRows}>Fill All Rows</button>
            </section>
            <section style={{ marginBottom: "2rem", width: "100%" }}>
              <button
                onClick={handleBatchAssign}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "16px",
                  backgroundColor: "#006400",
                  color: "white",
                }}
              >
                Batch Assign
              </button>
            </section>
            <section style={{ width: "100%" }}>
              <div style={{ marginTop: "1rem", color: "blue" }}>
                <strong>Status:</strong> {status}
              </div>
            </section>
          </details>

          {/* Section: UnAssign Community USDC (CT) */}
          <details style={{ width: "100%", marginBottom: "2rem" }}>
            <summary style={{ cursor: "default", fontSize: "1.2rem", marginBottom: "1rem" }}>
              UnAssign Community USDC (CT)
            </summary>
            <section style={{ width: "100%" }}>
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
            </section>
            <section style={{ marginBottom: "2rem", width: "100%", padding: "1rem", border: "1px solid #ccc" }}>
              <h3>Fill All Tags and Concepts</h3>
              <div style={{ marginBottom: "0.5rem" }}>
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
              <div style={{ marginBottom: "0.5rem" }}>
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
              <button onClick={fillAllRows}>Fill All Rows</button>
            </section>
            <section style={{ marginBottom: "2rem", width: "100%" }}>
              <button
                onClick={handleBatchUnassign}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "16px",
                  backgroundColor: "#8B0000",
                  color: "white",
                }}
              >
                UnAssign
              </button>
            </section>
            <section style={{ width: "100%" }}>
              <div style={{ marginTop: "1rem", color: "blue" }}>
                <strong>Status:</strong> {status}
              </div>
            </section>
          </details>

          {/* New Section: External Transfer */}
          <details style={{ width: "100%", marginBottom: "2rem" }}>
            <summary style={{ cursor: "default", fontSize: "1.2rem", marginBottom: "1rem" }}>
              External Transfer
            </summary>
            <section style={{ width: "100%" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  <strong>Recipient Address:</strong>{" "}
                  <input
                    type="text"
                    value={extTransferRecipient}
                    onChange={(e) => setExtTransferRecipient(e.target.value)}
                    placeholder="Enter recipient address"
                    style={{ width: "400px" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  <strong>Amount (USDC):</strong>{" "}
                  <input
                    type="number"
                    value={extTransferAmount}
                    onChange={(e) => setExtTransferAmount(e.target.value)}
                    placeholder="Enter amount"
                    style={{ width: "200px" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  <strong>Tag:</strong>{" "}
                  <input
                    type="text"
                    value={extTransferTag}
                    onChange={(e) => setExtTransferTag(e.target.value)}
                    placeholder="Enter tag"
                    style={{ width: "200px" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  <strong>Concept:</strong>{" "}
                  <input
                    type="text"
                    value={extTransferConcept}
                    onChange={(e) => setExtTransferConcept(e.target.value)}
                    placeholder="Enter concept"
                    style={{ width: "200px" }}
                  />
                </label>
              </div>
              <section style={{ marginBottom: "2rem", width: "100%" }}>
                <button
                  onClick={handleExternalTransfer}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "16px",
                    backgroundColor: "#FFA500",
                    color: "white",
                  }}
                >
                  External Transfer
                </button>
              </section>
              <section style={{ width: "100%" }}>
                <div style={{ marginTop: "1rem", color: "blue" }}>
                  <strong>Status:</strong> {status}
                </div>
              </section>
            </section>
          </details>

          {/* New Section: Deposit */}
          <details style={{ width: "100%", marginBottom: "2rem" }}>
            <summary style={{ cursor: "default", fontSize: "1.2rem", marginBottom: "1rem" }}>
              Deposit USDC
            </summary>
            <section style={{ width: "100%" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  <strong>Amount (USDC):</strong>{" "}
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount to deposit"
                    style={{ width: "200px" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  <strong>Tag:</strong>{" "}
                  <input
                    type="text"
                    value={depositTag}
                    onChange={(e) => setDepositTag(e.target.value)}
                    placeholder="Enter tag"
                    style={{ width: "200px" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  <strong>Concept:</strong>{" "}
                  <input
                    type="text"
                    value={depositConcept}
                    onChange={(e) => setDepositConcept(e.target.value)}
                    placeholder="Enter concept"
                    style={{ width: "200px" }}
                  />
                </label>
              </div>
              <section style={{ marginBottom: "2rem", width: "100%" }}>
                <button
                  onClick={handleDeposit}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "16px",
                    backgroundColor: "#008000",
                    color: "white",
                  }}
                >
                  Deposit
                </button>
              </section>
              <section style={{ width: "100%" }}>
                <div style={{ marginTop: "1rem", color: "blue" }}>
                  <strong>Status:</strong> {status}
                </div>
              </section>
            </section>
          </details>
        </details>
      )}
    </div>
  );
};

export default PoolsManager;
