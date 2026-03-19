// src/ingestion/priceFetcher.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { asset, currency } from '../../config.js';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';

export async function fetchPrice() {
  const runId = uuidv4();

  const response = await axios.get(COINGECKO_URL, {
    params: {
      ids: asset,
      vs_currencies: currency,
      include_last_updated_at: true,
    },
    timeout: 10000,
  });

  const price = response.data[asset][currency];
  const timestamp = new Date().toISOString();

  return {
    runId,
    asset,
    currency,
    price,
    timestamp,
  };
}