// pages/api/verify.js
import { Client } from 'xrpl';

export default async function handler(req, res) {
  const { documentHash, account } = req.body;

  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  try {
    const txs = await client.request({
      command: 'account_tx',
      account: account,
      ledger_index_min: -1,
      ledger_index_max: -1,
      binary: false,
      forward: false
    });

    client.disconnect();

    const match = txs.result.transactions.find(tx => 
      tx.tx.Memos && tx.tx.Memos.some(memo => memo.Memo.MemoData === documentHash)
    );

    if (match) {
      res.status(200).json({ verified: true, transaction: match });
    } else {
      res.status(200).json({ verified: false });
    }
  } catch (error) {
    client.disconnect();
    res.status(500).json({ error: error.message });
  }
}
