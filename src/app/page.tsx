"use client";

import {
  Blink,
  useBlink,
} from "@dialectlabs/blinks";
import { useBlinkSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import "@dialectlabs/blinks/index.css";

import { StepCard } from "./components/step-card";

// Text for the steps on the left side of the page for the user to follow
const steps = [
  {
    icon: "icon-cog",
    chip: {
      text: "Backend",
      icon: "icon-cog",
    },
    headline: "Stake SOL API",
    text: "This Blink allows you to stake your SOL tokens with the Solflare validator to earn staking rewards. \n\nThe staking API is configured in `/src/app/api/actions/stake-sol/route.ts`",
  },
  {
    icon: "icon-code",
    chip: {
      text: "Frontend",
      icon: "icon-code",
    },
    headline: "Staking UI",
    text: "Choose from preset staking amounts or enter a custom amount to stake. Your SOL will be staked with the Solflare validator and start earning rewards. \n\nThe UI is rendered in `src/app/page.tsx`",
  },
];

export default function Home() {
  const blinkApiUrl = "http://localhost:3000/api/actions/stake-sol";

  // Adapter, used to connect to the wallet
  const { adapter } = useBlinkSolanaWalletAdapter(
    "https://api.mainnet-beta.solana.com"
  );

  // Blink we want to execute
  const { blink, isLoading } = useBlink({ url: blinkApiUrl });

  return (
    <main className="grid grid-cols-[2fr_3fr] h-[calc(100vh-64px)]">
      <div className="col-span-1 p-8 pr-16 overflow-y-auto">
        <h1 className="text-[40px] mb-3 font-bold leading-[1]">
          Solana Staking with Solflare
        </h1>
        <h2 className="text-[18px] mb-2">
          Stake your SOL tokens and earn rewards with the Solflare validator.
        </h2>
        {steps.map((step, i) => (
          <StepCard
            key={i}
            chip={step.chip}
            headline={step.headline}
            text={step.text}
          />
        ))}
      </div>

      <div className=" flex items-center justify-center border border-gray-600 rounded-[10px] m-4">
        {isLoading || !blink ? (
          <span>Loading</span>
        ) : (
          <div className="w-full max-w-lg">
            <Blink
              blink={blink}
              adapter={adapter}
              securityLevel="all"
              stylePreset="x-dark"
              websiteUrl={"https://solflare.com"}
              websiteText={"Solflare"}
            />
          </div>
        )}
      </div>
    </main>
  );
}
