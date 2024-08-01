require("dotenv").config();

const {
  LightSystemProgram,
  Rpc,
  confirmTx,
  createRpc,
} = require("@lightprotocol/stateless.js");

const {
  createMint,
  mintTo,
  transfer,
} = require("@lightprotocol/compressed-token");

const { Keypair } = require("@solana/web3.js");

const payer = Keypair.generate();
const tokenRecipient = Keypair.generate();

const API_KEY = process.env.HELIUS_API_KEY;
// Helius exposes Solana and Photon RPC endpoints through a single URL
const HELIUS_ENDPOINT = `https://devnet.helius-rpc.com?api-key=${API_KEY}`;
const connection = createRpc(HELIUS_ENDPOINT, HELIUS_ENDPOINT);

const main = async () => {
  /// Airdrop lamports to pay fees
  await confirmTx(
    connection,
    await connection.requestAirdrop(payer.publicKey, 5e9)
  );

  await confirmTx(
    connection,
    await connection.requestAirdrop(tokenRecipient.publicKey, 1e6)
  );

  /// Create compressed-token mint
  const { mint, transactionSignature } = await createMint(
    connection,
    payer,
    payer.publicKey,
    9
  );

  console.log(`create-mint  success! txId: ${transactionSignature}`);

  /// Mint compressed tokens
  const mintToTxId = await mintTo(
    connection,
    payer,
    mint,
    payer.publicKey,
    payer,
    1e9
  );

  console.log(`mint-to      success! txId: ${mintToTxId}`);

  /// Transfer compressed tokens from payer to tokenRecipient's pubkey
  const transferTxId = await transfer(
    connection,
    payer,
    mint,
    7e8,
    payer,
    tokenRecipient.publicKey
  );

  console.log(`transfer     success! txId: ${transferTxId}`);
};

main();
