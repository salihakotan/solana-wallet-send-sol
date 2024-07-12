"use client";
import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

const Wallet = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  const [swapAmount, setSwapAmount] = useState(0);
  const [swapRate, setSwapRate] = useState(1); // Placeholder for swap rate

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((balance) => {
        setBalance(balance / LAMPORTS_PER_SOL);
      });
    }
  }, [publicKey, connection]);

  const handleAirDrop = async () => {
    if (publicKey) {
      const airdropSignature = await connection.requestAirdrop(
        publicKey,
        LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);
      const newBalance = await connection.getBalance(publicKey);
      setBalance(newBalance / LAMPORTS_PER_SOL);
    }
  };

  const handleSwap = async () => {
    if (publicKey && swapAmount > 0 && balance >= swapAmount) {
      // Placeholder logic for swap
      // In a real-world scenario, you would send a transaction to a smart contract to handle the swap
      const newBalance = balance - swapAmount * swapRate;
      setBalance(newBalance);
    }
  };

  return (
    <div className="wallet">
      <h2>My Wallet</h2>
      <WalletMultiButton />
      {publicKey && (
        <div>
          <p>Address: {publicKey.toBase58()}</p>
          <p>Balance: {balance} SOL</p>
          <button onClick={handleAirDrop}>AirDrop 1 SOL</button>
          <div>
            <input
              type="number"
              value={swapAmount}
              onChange={(e) => setSwapAmount(parseFloat(e.target.value))}
              placeholder="Amount to swap"
            />
            <button onClick={handleSwap}>Swap SOL</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;