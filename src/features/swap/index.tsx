import SettingsTrigger from "./components/SettingsTrigger";
import SwapForm from "./components/SwapForm";

const Swap = () => {
  return (
    <div
      id="swap-container"
      className="w-full max-w-116.25 mx-auto px-4 md:px-2 md:pb-4 mt-6 md:mt-12"
    >
      <div className="w-full flex items-center justify-between gap-2 mb-2">
        <h1 className="text-xl text-white font-bold">Swap</h1>
        <SettingsTrigger />
      </div>

      <SwapForm />
    </div>
  );
};

export default Swap;
