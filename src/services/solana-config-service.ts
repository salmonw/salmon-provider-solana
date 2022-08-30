import axios from 'axios';
import { INetwork, INetworkConfigItem } from '@salmonw/provider-base/src/types/config';
import { SALMON_API_URL } from '../constants/solana-constants';

const getNetworks = async () :Promise<INetwork[]> => {
  const { data } : { data:INetwork[] } = await axios.get(`${SALMON_API_URL}/v1/solana/networks`);
  return data;
};

const getConfig = async (networkId):Promise<INetworkConfigItem> => {
  try {
    const { data }: { data: INetworkConfigItem } = await axios.get<INetworkConfigItem>(`${SALMON_API_URL}/v1/solana/config`, {
      headers: { 'X-Network-Id': networkId },
    });
    return data;
  } catch (e: unknown) {
    // JEST has problems with axios exceptions
    // returning circular objetcs when tries to stringify error.
    if (e instanceof Error) {
      throw (Error(`Error getting config ${e.message}`));
    } else {
      throw (Error('Unknown error getting config'));
    }
  }
};

export {
  getNetworks,
  getConfig,
};
