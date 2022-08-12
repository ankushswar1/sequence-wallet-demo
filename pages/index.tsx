import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Button from '@mui/material/Button';
import { sequence } from "0xsequence";
import React, { useState } from 'react';
import { sanitizeNumberString } from '0xsequence/dist/declarations/src/utils';

const Home: NextPage = () => {
  const [wallet, setWallet] = useState<sequence.provider.Wallet>();
  const [chainId, setChainId] = useState('');
  const [walletDetails, setWalletDetails] = useState<sequence.provider.ConnectDetails>();
  const [address, setAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [signature, setSignature] = useState<string | undefined>();
  const [isVerified, setIsVerified] = useState(false);

  async function connectWallet() {
    const wallet = await sequence.initWallet('mumbai');
    const connectDetails = await wallet.connect({
      app: 'Sequence Demo App',
      authorize: true,
      // And pass settings if you would like to customize further
      settings: {
        theme: "light",
        bannerUrl: "https://lh3.googleusercontent.com/IDTy-NAz28oux-1skzGthlL67wU-ziW2AZ8YwizVb4vfvDFC7Ns6MGjPmwx--lsKgV8EumCLP67rFjS7qG39OlmdUE4tQxN9-hhggYD8m48DH-rbCvhyeTjfFC6rEsCoVT9p5R31",  // 3:1 aspect ratio, 1200x400 works best
        // includedPaymentProviders: ["moonpay", "ramp"],
        // defaultFundingCurrency: "eth",
        lockFundingCurrencyToDefault: false,
      }
    });

    const address = await wallet.getAddress();

    console.log(connectDetails)
    if (connectDetails.connected) { 
      setIsConnected(true);
      setWalletDetails(connectDetails);
      setWallet(wallet);
      setAddress(address);
    }
  }

  async function openWallet() { 
    if (isConnected) {
      wallet?.openWallet();
    }
  }

  async function signMsg() {
    const signer = wallet?.getSigner();
    const msg = "Hello World!";
    const sig = await signer?.signMessage(msg);
    setSignature(sig);
  }

  async function verifySignature() {
    const provider = wallet?.getProvider();
    const isValid = await sequence.utils.isValidMessageSignature(
      address,
      "Hello World!",
      signature, 
      provider,
      walletDetails.chainId
    )
    if (isValid) {
      setIsVerified(true);
    }
  }

  async function sendTx() {
    const tx = {
      to: "0x59D3eB21Dd06A211C89d1caBE252676e2F3F2218",
      value: 10000000
    }
    console.log(walletDetails?.chainId)
    const signer = wallet?.getSigner();
    const txResponse = await signer?.sendTransaction(tx, walletDetails?.chainId)
    const done = await txResponse?.wait();
    console.log(txResponse);
    console.log(done);
  }



  return (
    <div className={styles.container}>
      <Head>
        <title>Sequence Demo App</title>
        <meta name="description" content="idk" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isConnected ? (
          <>
            <p>Connected to address: {address}</p>
            <Button onClick={openWallet} variant="contained" size="large">Open Wallet</Button>
            <p> </p>
            {signature ? (
              <div>
                <p>Signature: {signature.substring(0,18) + '...'}</p>
                {isVerified ? (
                  <p>Signature verified correctly.</p>
                ) : (                    
                  <Button onClick={verifySignature} variant="contained" size="large">Verify Signature</Button>                
                )}
              </div>
            ) : (
              <Button onClick={signMsg} variant="contained" size="large">Sign 'Hello World!'</Button>
            )}
            <p> </p>
            <Button onClick={sendTx} variant="contained" size="large">Send Ankush money</Button>
          </>
          ) :
        (
          <Button onClick={connectWallet} variant="contained" size="large">Sign In</Button>
        )}
        
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home
