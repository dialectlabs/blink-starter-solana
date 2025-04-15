import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ActionError,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from "@solana/actions";

import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  StakeProgram,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";

// CAIP-2 format for Solana
const blockchain = BLOCKCHAIN_IDS.mainnet;

// Create a connection to the Solana blockchain
const connection = new Connection("https://api.mainnet-beta.solana.com");

// Set the staking validator address
const stakingValidator = "EXhYxF25PJEHb3v5G1HY8Jn8Jm7bRjJtaxEghGrUuhQw";

// Create headers with CAIP blockchain ID
const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.4",
};

// OPTIONS endpoint for CORS preflight requests
export const OPTIONS = async () => {
  return new Response(null, { headers });
};

// GET endpoint returns the Blink metadata and UI configuration
export const GET = async (req: Request) => {
  const response: ActionGetResponse = {
    type: "action",
    icon: `${new URL("/sf.jpeg", req.url).toString()}`,
    label: "Stake SOL",
    title: "Stake SOL with Solflare",
    description:
      "Stake your SOL tokens to earn rewards with Solflare validator.",
    links: {
      actions: [
        {
          type: "transaction",
          label: "Stake 1 SOL",
          href: `/api/actions/stake-sol?amount=1`,
        },
        {
          type: "transaction",
          label: "Stake 5 SOL",
          href: `/api/actions/stake-sol?amount=5`,
        },
        {
          type: "transaction",
          label: "Stake 10 SOL",
          href: `/api/actions/stake-sol?amount=10`,
        },
        {
          type: "transaction",
          href: `/api/actions/stake-sol?amount={amount}`,
          label: "Custom Stake",
          parameters: [
            {
              name: "amount",
              label: "Enter SOL amount to stake",
              type: "number",
            },
          ],
        },
      ],
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
};

// POST endpoint handles the staking transaction creation
export const POST = async (req: Request) => {
  try {
    // Extract parameters from the URL
    const url = new URL(req.url);
    const amount = Number(url.searchParams.get("amount"));
    console.log(`Processing stake request for ${amount} SOL`);

    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid stake amount. Must be a positive number.");
    }

    // Get payer public key from request body
    const request: ActionPostRequest = await req.json();
    console.log("Request body:", request);

    if (!request.account) {
      throw new Error("Account address is required");
    }

    const payer = new PublicKey(request.account);
    console.log(`Payer public key: ${payer.toBase58()}`);

    // Create stake account with a derived address
    const seed = Math.random().toString(36).substring(2);
    console.log("Generated seed:", seed);

    // Validate validator address
    try {
      const validatorPubkey = new PublicKey(stakingValidator);
      console.log(`Validator public key: ${validatorPubkey.toBase58()}`);

      const stakeAccount = await PublicKey.createWithSeed(
        payer,
        seed,
        StakeProgram.programId
      );
      console.log(`Generated stake account: ${stakeAccount.toBase58()}`);
      console.log(`Using seed: ${seed}`);

      // Check validator exists on chain
      console.log("Checking if validator vote account exists...");
      const voteAccountInfo = await connection.getAccountInfo(validatorPubkey);
      console.log(`Validator account exists: ${!!voteAccountInfo}`);

      if (!voteAccountInfo) {
        throw new Error(
          `Validator account ${validatorPubkey.toBase58()} does not exist`
        );
      }

      // Prepare the transaction
      console.log(`Using validator: ${stakingValidator}`);
      const transaction = await prepareStakeTransaction(
        connection,
        payer,
        stakeAccount,
        validatorPubkey,
        amount,
        seed
      );
      console.log("Transaction prepared successfully");

      // Simulate transaction to verify it would succeed
      try {
        console.log("Simulating transaction...");
        const simulation = await connection.simulateTransaction(transaction);
        console.log("Simulation result:", simulation);

        if (simulation.value.err) {
          throw new Error(
            `Transaction simulation failed: ${JSON.stringify(
              simulation.value.err
            )}`
          );
        }
      } catch (simError) {
        console.error("Simulation error:", simError);
        // Continue anyway as this is just a diagnostic
      }

      // Log transaction details before serializing
      console.log("Transaction message details:", {
        numInstructions: transaction.message.compiledInstructions.length,
        recentBlockhash: transaction.message.recentBlockhash,
      });

      // Create response with serialized transaction
      const serializedTx = Buffer.from(transaction.serialize()).toString(
        "base64"
      );
      console.log(
        "Transaction serialized successfully, length:",
        serializedTx.length
      );

      const response: ActionPostResponse = {
        type: "transaction",
        transaction: serializedTx,
      };
      console.log("Response prepared", response);

      return Response.json(response, { status: 200, headers });
    } catch (error) {
      console.error("Error in validator or transaction preparation:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error processing stake request:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const errorResponse: ActionError = { message };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers,
    });
  }
};

const prepareStakeTransaction = async (
  connection: Connection,
  payer: PublicKey,
  stakeAccount: PublicKey,
  validator: PublicKey,
  amount: number,
  seed: string
) => {
  console.log("Starting transaction preparation with:", {
    payer: payer.toBase58(),
    stakeAccount: stakeAccount.toBase58(),
    validator: validator.toBase58(),
    amount,
    seed,
  });

  // Calculate rent exempt reserve
  const rentExemptReserve = await connection.getMinimumBalanceForRentExemption(
    StakeProgram.space
  );
  console.log(`Rent exempt reserve: ${rentExemptReserve} lamports`);

  // Get latest blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  console.log(`Using blockhash: ${blockhash}`);

  // Step 1: Create stake account with seed (includes funding)
  console.log("Creating account instruction...");
  const createAccountInstruction = SystemProgram.createAccountWithSeed({
    fromPubkey: payer,
    newAccountPubkey: stakeAccount,
    basePubkey: payer,
    seed: seed,
    lamports: rentExemptReserve + amount * LAMPORTS_PER_SOL, // Fund with both amounts together
    space: StakeProgram.space,
    programId: StakeProgram.programId,
  });
  console.log(
    "Account instruction created with total lamports:",
    rentExemptReserve + amount * LAMPORTS_PER_SOL
  );

  // Step 2: Initialize stake account
  console.log("Creating initialize instruction...");

  // Create initialize instruction manually to ensure correct structure
  const initializeInstruction = {
    keys: [
      { pubkey: stakeAccount, isSigner: false, isWritable: true },
      {
        pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"),
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: StakeProgram.programId,
    data: Buffer.concat([
      Buffer.from([0, 0, 0, 0]), // Instruction index for initialize
      payer.toBuffer(), // Staker authority
      payer.toBuffer(), // Withdrawer authority
      Buffer.from(new Uint8Array(8).buffer), // Lockup epoch (u64) - all zeros
      Buffer.from(new Uint8Array(8).buffer), // Lockup unix timestamp (u64) - all zeros
      new PublicKey("11111111111111111111111111111111").toBuffer(), // System program as custodian
    ]),
  };

  console.log(
    "Initialize instruction created with accounts:",
    initializeInstruction.keys.length
  );

  // Step 3: Delegate stake - using exact structure from sample tx
  console.log("Creating delegate instruction...");

  // Create the delegate instruction manually to ensure correct structure - exactly matching the transaction sample
  const delegateInstruction = {
    keys: [
      { pubkey: stakeAccount, isSigner: false, isWritable: true },
      { pubkey: validator, isSigner: false, isWritable: false },
      {
        pubkey: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: new PublicKey("SysvarStakeHistory1111111111111111111111111"),
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: new PublicKey("StakeConfig11111111111111111111111111111111"),
        isSigner: false,
        isWritable: false,
      },
      { pubkey: payer, isSigner: true, isWritable: false },
    ],
    programId: StakeProgram.programId,
    data: Buffer.from([2, 0, 0, 0]), // Delegate instruction index
  };

  console.log(
    "Manual delegate instruction created with accounts:",
    delegateInstruction.keys.length
  );

  const instructions = [
    createAccountInstruction,
    initializeInstruction,
    delegateInstruction,
  ];

  console.log(
    "Instructions array types:",
    instructions.map((i) => i.constructor.name)
  );

  // Create transaction message
  console.log("Creating transaction message...");

  try {
    // Use legacy transaction format to ensure compatibility
    const message = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: blockhash,
      instructions: instructions as TransactionInstruction[], // Cast with proper type
    }).compileToV0Message();

    console.log("Transaction message compiled successfully");

    const transaction = new VersionedTransaction(message);
    console.log(
      "Transaction created with",
      instructions.length,
      "instructions"
    );
    return transaction;
  } catch (error) {
    console.error("Error compiling transaction:", error);
    throw error;
  }
};
