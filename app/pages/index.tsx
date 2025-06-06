import Head from "next/head";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { ToastContainer } from 'react-toastify';
import dynamic from 'next/dynamic';

const ChartTrtnUsdcDynamic = dynamic(() => import('../components/lp/ChartTrtnUsdc'), { ssr: false });

import WavesBg from "../public/images/wave.svg";

import {useEffect, useRef, useState} from "react";
import Navigation from "../components/lp/Navigation";
import LiquidPool from "../components/lp/LiquidPool";
import Exchange from "../components/lp/Exchange";
import Deposit from "../components/lp/Deposit";
import ConnectDialog from "../components/shared/ConnectDialog";
import useLPStore from "../hooks/useLPStore";
import Stake from "../components/lp/Stake";
import TokenPanel from "../components/shared/TokenPanel";
import {useDocumentVisibility} from "../hooks/useDocumentVisibility";
import useShillCityCaptitalStore from "../hooks/useShillCityCaptitalStore";

enum Tabs {
  Exchange = "Exchange",
  Deposit = "Deposit",
  Stake = "Stake",
}
let refreshStatsTimer: any;

export default function Home() {
  const wallet = useAnchorWallet();
  const tideState = useLPStore((state) => state.tideState);
  const psdnState = useLPStore((state) => state.psdnState);
  const [activeTab, setActiveTab] = useState(Tabs.Deposit);
  const setupTide = useLPStore((state) => state.setupTide);
  const setupPoseidon = useLPStore((state) => state.setupPoseidon);
  const getTideStats = useLPStore((state) => state.getTideStats);
  const getSccStats = useShillCityCaptitalStore((state) => state.getSccStats);
  const getPsdnStats = useLPStore((state) => state.getPsdnStats);
  const getAccountStats = useLPStore((state) => state.getAccountStats);

  const documentIsHidden = useDocumentVisibility();

  useEffect(() => {
    if (wallet?.publicKey) {
      setupPoseidon(wallet);
      setupTide(wallet);
      getSccStats(wallet);
    }
  }, [wallet]);

  useEffect(() => {
    // documentIsHidden = true if user is in another tab
    if(documentIsHidden) {
      if(refreshStatsTimer) {
        clearInterval(refreshStatsTimer);
        refreshStatsTimer = null;
      }
    } else {
      if (psdnState?.poseidon && tideState?.tide) {
        getPsdnStats();
        getAccountStats();
        getTideStats();
        if (!refreshStatsTimer) {
          refreshStatsTimer = setInterval(() => {
            getPsdnStats();
            getAccountStats();
            getTideStats();
          }, 10000);
        }
      }
    }
    return function cleanup() {
      clearInterval(refreshStatsTimer);
    };
  }, [psdnState, tideState, documentIsHidden]);

  return (
    <div>
      <Head>
        <title>Poseidon Liquidity Pool</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation activeId="poseidon-lp" />
      <main className="justify-center min-h-screen relative bg-body md:bg-transparent">
        <video
          autoPlay
          muted
          loop
          playsInline
          id="myVideo"
          className="absolute inset-0 max-w-none w-full h-full object-cover -z-10 hidden md:block"
        >
          <source src="/videos/bg.mp4" type="video/mp4" />
        </video>
        <img
          src="/images/long.jpg"
          style={{zIndex: '-9'}}
          className="mix-blend-lighten w-full hidden md:block absolute bottom-0 left-0 right-0"
        />
        <div
          style={{ backgroundImage: `url(${WavesBg.src})` }}
          className="bg-bottom bg-no-repeat bg-cover pt-16 md:pt-20"
        >
          <div className="px-4 pt-8 pb-14 md:pb-20 container mx-auto max-w-screen-xl text-neutral-content bg-center">
            <div className="flex flex-col lg:flex-row pb-10 md:pt-6 lg:items-center place-content-center">
              <div className="flex items-center basis-10/12 flex-col lg:flex-row">
                <div className="flex md:place-content-center pb-6 lg:pb-0">
                  <div>
                    <img
                      src="/logo-poseidon-lp.png"
                      className="w-32 md:w-40 lg:pr-6"
                    />
                  </div>
                </div>
                <div className="flex w-full lg:w-auto flex-grow md:pt-4 md:pt-0">
                  <div className="font-jangkuy text-xl md:text-2xl mx-auto flex-auto text-secondary-content">
                    <div className="lg:max-w-sm text-center text-2xl md:text-3xl lg:text-left">
                      Provide Liquidity <br />
                      and EARN $TRTN
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 lg:pt-0 lg:flex text-center lg:text-left ">
                <div className="lg:pl-0 lg:pt-0">
                  <ul className="steps steps-vertical">
                    <li className="step step-accent !text-left">
                      <div className="pb-3">
                        <strong>Deposit $TRTN + $USDC</strong>
                        <br />Receive $SHELL and start earning 1% of transaction fees.
                      </div>
                    </li>
                    <li className="step  step-accent !text-left">
                      <div>
                        <strong>Stake your $SHELL in the Tide Pool</strong>
                        <br />Start earning your portion of the daily 2000 $TRTN emission.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 container mx-auto max-w-screen-xl text-neutral-content bg-center">
          <ConnectDialog />
          <div className="flex gap-4 xl:gap-8 flex-col-reverse lg:flex-row">
            <div className="md:flex-1 mb-6">
              <LiquidPool />
            </div>
            <div className="flex flex-col lg:w-[380px] mb-6">
              <div className="tabs divide-x divide-black divide-opacity-10 bg-black bg-opacity-25 rounded-box rounded-b-none w-full grid grid-cols-3 backdrop-blur-sm">
                {Object.entries(Tabs).map(([key, value]) => (
                  <div
                    key={key}
                    onClick={() => setActiveTab(value)}
                    className={`tab relative tab-lg ${
                      activeTab == value ? "border-r-transparent" : ""
                    }`}
                  >
                    <div
                      className={`${
                        activeTab == value
                          ? "absolute -top-3 pt-5 left-0 right-0 bottom-0 text-white bg-green rounded-box rounded-b-none"
                          : "pt-1"
                      }`}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className={`bg-green rounded-box rounded-t-none p-5 xl:p-8 ${
                  activeTab == Tabs.Deposit ? "" : "hidden"
                }`}
              >
                <Deposit />
              </div>
              <div
                className={`bg-green rounded-box rounded-t-none p-5 xl:p-8 ${
                  activeTab == Tabs.Exchange ? "" : "hidden"
                }`}
              >
                <Exchange />
              </div>
              <div
                className={`bg-green rounded-box rounded-t-none p-5 xl:p-8 ${
                  activeTab == Tabs.Stake ? "" : "hidden"
                }`}
              >
                <Stake />
              </div>
              <TokenPanel />
            </div>
          </div>
          <div>
            <div className="card bg-neutral/90 backdrop-blur-sm">
              <div className="card-body">
                <h2 className="mb-2">TRTN Price + Circulating Supply</h2>
                <ChartTrtnUsdcDynamic />
              </div>
            </div>
          </div>
        </div>
        <footer className="h-[180px] lg:h-[300px] hidden md:block relative">
          <img
            src="/images/squid.png"
            className="w-[200px] lg:w-[400px]  absolute -bottom-5 lg:-bottom-10"
          />
          <img
            src="/images/solplayboy.png"
            className="w-[120px] lg:w-[300px] absolute top-16 lg:top-10 left-1/2"
          />
        </footer>
        <ToastContainer position="top-center" theme="dark" />
      </main>
    </div>
  );
}
