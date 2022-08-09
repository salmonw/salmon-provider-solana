'use strict';

import axios from 'axios';
import { SALMON_API_URL } from '../constants/solana-constants';

const getNetworks = async () => {
  const { data } = await axios.get(`${SALMON_API_URL}/v1/solana/networks`);
  return data;
};

const getConfig = async (networkId) => {
  const { data } = await axios.get(`${SALMON_API_URL}/v1/solana/config`, {
    headers: { 'X-Network-Id': networkId },
  });
  return data;
};

export {
  getNetworks,
  getConfig,
};
