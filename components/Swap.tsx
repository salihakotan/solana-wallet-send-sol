"use client";
import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram, TransactionInstruction, sendAndConfirmTransaction } from "@solana/web3.js";
import * as splToken from '@solana/spl-token';


import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AnchorProvider, BN, Program, Wallet } from "@project-serum/anchor";
import { web3 } from "@project-serum/anchor";


const Swap = () => {
 
  const [txSig, setTxSig] = useState('');
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const link = () => {
      return txSig ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet` : ''
  }



  const [open, setOpen] = useState<boolean>(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [userWalletAddress, setUserWalletAddress] = useState<string>("");

  

//---------------------SWAP-------------------------
  const [swapAmount, setSwapAmount] = useState(0);
  const [swapRate, setSwapRate] = useState(1); 

  
  const SWAP_PROGRAM_ID =  SystemProgram.programId
 
const TOKEN_A_ACCOUNT = new PublicKey('EBcMVJd61ty7CczCxR9r3zsfSaMvmwHkvwhbNYKMr61S'); 
let TOKEN_B_ACCOUNT = new PublicKey('4tTsKqBm3eVVATV27Wvw3Gscx2uYuDMWXeqfbg7keGwv'); 

const [swapAddress,setSwapAddress] = useState("4tTsKqBm3eVVATV27Wvw3Gscx2uYuDMWXeqfbg7keGwv") //token b account


const sendSol = () => {
  if (!connection || !publicKey) { return }
  const transaction = new web3.Transaction()
  const recipientPubKey = new web3.PublicKey(swapAddress)

  const sendSolInstruction = web3.SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: recipientPubKey,
      lamports: LAMPORTS_PER_SOL * swapAmount
  })

  transaction.add(sendSolInstruction)
  sendTransaction(transaction, connection).then(sig => {
      setTxSig(sig)
  })
}


  useEffect(() => {
    if (!connection || !publicKey) {
      return;
    }

    connection.onAccountChange(
      publicKey,
      (updatedAccountInfo) => {
        setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
      },
      "confirmed"
    );

    connection.getAccountInfo(publicKey).then((info) => {
      if (info) {
        setBalance(info?.lamports / LAMPORTS_PER_SOL);
      }
    });
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
    if (publicKey && swapAmount > 0 && balance! >= swapAmount) {
      try {

        const SEED = 'swap_authority';
  const [swapAuthorityPDA, bump] = await PublicKey.findProgramAddressSync(
    [Buffer.from(SEED)],
    SWAP_PROGRAM_ID
  );

        // Create a transaction
        const transaction = new Transaction();
        TOKEN_B_ACCOUNT = new PublicKey(swapAddress); 
  
        // Define the swap instruction
        const swapInstruction = new TransactionInstruction({
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true }, 
            { pubkey: TOKEN_A_ACCOUNT, isSigner: false, isWritable: true }, 
            { pubkey: TOKEN_B_ACCOUNT, isSigner: false, isWritable: true }, 
            { pubkey: swapAuthorityPDA, isSigner: false, isWritable: false }, 
          ],
          programId: SWAP_PROGRAM_ID,
          data: Buffer.from(Uint8Array.of(0, ...new BN(swapAmount).toArray("le", 8))),
        });
  
        transaction.add(swapInstruction);


      //   const {
      //     context: { slot: minContextSlot },
      //     value: { blockhash, lastValidBlockHeight }
      // } = await connection.getLatestBlockhashAndContext();

      // const signature = await sendTransaction(transaction, connection, { minContextSlot });

      // await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });

  
        // Send the transaction
        const signature = await sendTransaction(transaction,connection);
  
        // Confirm the transaction
        await connection.confirmTransaction(signature, 'confirmed');
  
        // Update the balance
        const newBalance = await connection.getBalance(publicKey);
        setBalance(newBalance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Swap transaction failed', error);
      }
    }
  };

  

  useEffect(() => {
    setUserWalletAddress(publicKey?.toBase58()!);
  }, [publicKey]);

  


  return (
    <div className="text-white">
       <div className="wallet">
      {publicKey && (
        <div>
          <p>Address: {publicKey.toBase58()}</p>
          <p>Balance: {balance} SOL</p>
          <button className="bg-purple-600 h-10 p-2 rounded mt-5" onClick={handleAirDrop}>AirDrop 1 SOL</button>
          <div className="bg-gray-400 grid p-4 mt-4 rounded">
           
          <input style={{color:"black"}} value={swapAddress} onChange={(e)=> setSwapAddress(e.target.value)} className="m-2 h-10 p-3" placeholder="Swap address..."/>
            <input
            className="m-2 h-10 p-3"
              type="number"
              value={swapAmount}
              style={{color:"black"}}
              onChange={(e) => setSwapAmount(parseFloat(e.target.value))}
              placeholder="Amount to swap"
            />
            <button className="bg-purple-600 h-10 p-2 rounded mt-5"  onClick={sendSol}>Send SOL</button>
            </div>
        </div>
      )}
    </div>

    {
                txSig ?
                    <div>
                        <p>View your transaction on </p>
                        <a href={link()}>Solana Explorer</a>
                    </div> :
                    null
            }
    </div>
  );
};

export default Swap;