"use client";

import { Blink, useBlink } from "@dialectlabs/blinks";
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
    headline: "Blink API",
    text: "Blinks are headless APIs that return transactions, as well as educational metadata that can be used to render blink UIs. \n\nGet started by editing `/src/app/api/actions/donate-sol/route.ts`",
  },
  {
    icon: "icon-code",
    chip: {
      text: "Frontend",
      icon: "icon-code",
    },
    headline: "Blink UI",
    text: "Dialect's blinks UI components libraries can be used to render the blink data returned from the blink API backend. \n\nGet started by editing `src/app/page.tsx`",
  },
];

export default function Home() {
  const blinkApiUrl = "http://localhost:3000/api/actions/donate-sol";

  // Adapter, used to connect to the wallet
  const { adapter } = useBlinkSolanaWalletAdapter(
    "https://api.devnet.solana.com"
  );

  // Blink we want to execute
  const { blink, isLoading } = useBlink({ url: blinkApiUrl });

  return (
    <main className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] min-h-[calc(100vh-64px)]">
      <div className="col-span-1 p-4 lg:p-8 lg:pr-16 lg:overflow-y-auto">
        <h1 className="text-[32px] lg:text-[40px] mb-3 font-bold leading-[1]">
          Solana Blinks Starter Template
        </h1>
        <h2 className="text-[16px] lg:text-[18px] mb-4">
          Use this template project to get started developing your blink.
        </h2>
        <a
          href="https://docs.dialect.to/standard-blinks-library"
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-4 p-4 rounded-xl border border-green-800 bg-green-500/5 hover:bg-green-500/10 transition-colors duration-200 -ml-1"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-semibold tracking-wide uppercase text-[#7FFBAB]">
              🚀  New · Plug & Play
            </span>
          </div>
          <h3 className="text-[16px] font-bold text-white mb-1">
            Introducing the Standard Blinks Library (SBL)
          </h3>
          <p className="text-[14px] text-[#999999]">
            Production-ready, hosted blinks for top Solana protocols like
            Jupiter, Kamino, and MarginFi. Built and maintained by Dialect so
            you don&apos;t have to. Integrate with a single fetch.
          </p>
          <span className="inline-block mt-2 text-[14px] text-[#7FFBAB] font-medium">
            Learn more →
          </span>
        </a>
        {steps.map((step, i) => (
          <StepCard
            key={i}
            chip={step.chip}
            headline={step.headline}
            text={step.text}
          />
        ))}
      </div>

      <div className="flex items-center justify-center lg:border lg:border-gray-600 rounded-[10px] m-4">
        {isLoading || !blink ? (
          <span>Loading</span>
        ) : (
          <div className="w-full max-w-lg">
            <Blink
              blink={blink}
              adapter={adapter}
              securityLevel="all"
              stylePreset="x-dark"
            />
          </div>
        )}
      </div>
    </main>
  );
}
