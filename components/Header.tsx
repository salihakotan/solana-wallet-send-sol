import React from "react";
import WalletConnection from "./WalletConnection";

const Header = () => {
  return (
    <div className="h-[10vh] bg-purple-600 flex justify-center">
      <div className="max-w-[900px] flex justify-between items-center w-full">
        <div className="text-white font-bold text-[30px]">Wallet with Swap</div>
        <div>
          <WalletConnection />
        </div>
      </div>
    </div>
  );
};

export default Header;