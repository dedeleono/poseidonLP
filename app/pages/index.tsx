import Head from "next/head";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Poseidon Liquidity Pool</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="grid grid-cols-1 min-h-screen bg-base-200">
          <div className="text-center hero-content">
            <div className="max-w-xl">
              <div className="mockup-phone border-primary">
                <div className="camera"></div>
                <div className="display">
                  <div
                    className="artboard phone-3 artboard-demo px-4"
                    style={{ height: "420px" }}
                  >
                    <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box relative min-w-full justify-center">
                      {/* <div className="px-2 mx-2 navbar-start">
                        <span className="text-lg font-bold">Poseidon</span>
                      </div> */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="btn gap-4 hover:bg-transparent hover:border-0 p-0">
                          <WalletMultiButton
                            style={{
                              all: "unset",
                              height: "100%",
                              width: "100%",
                              zIndex: "10",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontFamily: "Montserrat",
                            }}
                          />
                        </div>
                        <div className="btn gap-4 hover:bg-transparent hover:border-0 p-0">
                          <WalletDisconnectButton
                            style={{
                              all: "unset",
                              height: "100%",
                              width: "100%",
                              zIndex: "10",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontFamily: "Montserrat",
                              padding: "0px !important",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* swap section */}
                    <div className="flex flex-row w-full h-[16rem]">
                      <div className="grid flex-grow h-full card bg-base-300 rounded-box place-items-center">
                        <div>
                          <label className="input-group input-group-md">
                            <input
                              type="text"
                              value="0.099"
                              className="input input-bordered input-md"
                            />
                            <span className="bg-base-200">TRTN</span>
                          </label>
                          <div className="divider"></div>
                          <label className="input-group input-group-md">
                            <input
                              type="text"
                              value="0.099"
                              className="input input-bordered input-md"
                            />
                            <span className="bg-base-200">USDC</span>
                          </label>
                          <div className="grid grid-cols-2 mt-4 gap-2">
                            <button className="btn btn-outline">swap</button>
                            <button className="btn btn-primary">stake</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
