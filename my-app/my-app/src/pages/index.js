import Head from 'next/head';
import Image from 'next/image';
import web3Modal from 'web3modal';
import { Contract, Signer, providers, utils } from 'ethers';
import { useRef, useEffect, useState } from 'react';
import { NFT_CONTRACT_ADDRESS, abi } from '../../constants';

export default function Home() {
  const web3ModalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberMinted, setNumberMinted] = useState(0);

  const getMintNumber = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      let _number = await nftContract.tokenIds();
      _number = _number.toString();
      setNumberMinted(_number);
    } catch (error) {
      console.log(error);
    }
  };

  const presaleMint = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

      const tx = await nftContract.presaleMint({
        value: utils.parseEther('0.005'),
      });
      await tx.wait();
      alert('you successfully minted a cryptoDev');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const publicMint = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const txn = await nftContract.mint({
        value: utils.parseEther('0.01'),
      });
      await txn.wait();
      alert('you successfully minted a cryptoDev');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const getOwner = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

      const owner = await nftContract.owner();

      const userAddress = await signer.getAddress();

      console.log('owner', owner);
      console.log('userAddress', userAddress);

      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error();
    }
    setLoading(false);
  };

  const connectWallet = async () => {
    await getProviderOrSigner();
    setWalletConnected(true);
  };

  const startPresale = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const txn = await nftContract.startPresale();

      await txn.wait();
      setPresaleStarted(true);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const checkIfPresaleHasStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _ispresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(_ispresaleStarted);
      return _ispresaleStarted;
    } catch (error) {
      console.error(error);

      return false;
    }
  };

  const checkIfPresaleHasEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      const presaleEndTime = await nftContract.presaleEnded();

      const currentTimeInSeconds = Date.now() / 1000;
      const hasPresaleEnded = presaleEndTime.lt(
        Math.floor(currentTimeInSeconds)
      );
      setPresaleEnded(hasPresaleEnded);
    } catch (error) {
      console.error();
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();

      if (chainId !== 11155111) {
        alert('Switch to sepolia ');
        throw new Error('Wrong Network! switch to sepolia');
      }

      if (needSigner) {
        const signer = await web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    } catch (error) {
      console.log(error);
    }
  };

  const onPageLoad = async () => {
    await connectWallet();
    await getOwner();
    const presaleStarted = await checkIfPresaleHasStarted();
    if (presaleStarted) {
      await checkIfPresaleHasEnded();
    }

    await getMintNumber();

    setInterval(async () => {
      await getMintNumber();
    }, 5000);

    setInterval(async () => {
      const presaleStarted = await checkIfPresaleHasStarted();
      if (presaleStarted) {
        await checkIfPresaleHasEnded();
      }
    }, 5000);
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new web3Modal({
        network: 'sepolia',
        providerOptions: {},
        disableInjectedProvider: false,
      });

      onPageLoad();
    }
  }, []);

  function renderBody() {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className='button'>
          connect your wallet
        </button>
      );
    }
    if (loading) {
      return <div>Loading...</div>;
    }
    if (isOwner && !presaleStarted) {
      // render a button to start presale
      return (
        <button className='button' onClick={startPresale}>
          Start presale
        </button>
      );
    }

    if (!presaleStarted) {
      return (
        <div>
          <span className='description'>
            Presale has not started yet. Come back later
          </span>
        </div>
      );
    }
    if (presaleStarted && !presaleEnded) {
      // allow presale to fini
      return (
        <div>
          <span className='description'>
            Presale has started. If you wallet is whitelisted,you can mint
            cryptoDev
          </span>
          <button className='button' onClick={presaleMint}>
            Presale mint
          </button>
        </div>
      );
    }
    if (presaleEnded) {
      // allow user in public sale
      return (
        <div>
          <span className='description'>
            Presale has ended. You can mint a cryptoDev in public sale if any
            remains
          </span>
          <button className='button' onClick={publicMint}>
            Public mint
          </button>
        </div>
      );
    }
  }

  return (
    <>
      <Head>
        <title>CrytoDevs NFT</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='main'>
        <div>
          <h1 className='title'>Welcome to cryptoDev NFT's</h1>
          <span className='description'>
            CryptoDev is an NFT-Collection for web3 developers
          </span>
          <div>{renderBody()}</div>
          <h1>{numberMinted}</h1>
        </div>
      </div>
    </>
  );
}
