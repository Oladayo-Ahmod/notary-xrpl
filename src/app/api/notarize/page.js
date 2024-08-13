import { Client, Wallet } from 'xrpl';
import CryptoJS from 'crypto-js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { documentContent, secret } = req.body;

    // Generate the document hash using SHA-256
    const documentHash = CryptoJS.SHA256(documentContent).toString();

    // Connect to the XRP Ledger
    const client = new Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    // Load the user's wallet using secret
    const wallet = Wallet.fromSeed(secret);

    // Create a transaction to add the hash as a memo
    const tx = {
      TransactionType: 'Payment',
      Account: wallet.classicAddress,
      Amount: '10',
      Destination: wallet.classicAddress,
      Memos: [{ Memo: { MemoData: documentHash } }]
    };

    try {
      const prepared = await client.autofill(tx);
      const signed = wallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      client.disconnect();

      res.status(200).json({ result, documentHash });
    } catch (error) {
      client.disconnect();
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
