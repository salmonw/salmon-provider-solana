import axios from 'axios';
import { SALMON_API_URL } from '../constants/solana-constants';
import { INft } from '../types/nft';

const getAll = async (networkId, publicKey, noCache = false): Promise<INft[]> => {
  const params = { publicKey, noCache };
  const response = await axios.get(`${SALMON_API_URL}/v1/solana/nft`, {
    params,
    headers: { 'X-Network-Id': networkId },
  });
  const { data } : { data:INft[] } = response;
  return data;
};

const getCollections = (nfts: INft[]):(string | null)[] => {
  const collections:(string | null)[] = nfts.map((nft) => {
    return nft.collection ? nft.collection.name : null;
  }).filter((e) => e !== null);
  return Array.from(new Set(collections));
};

const getNftsByCollection = (nfts: INft[]) => {
  const collections = getCollections(nfts);
  return collections
    .map((collection) => {
      const items: INft[] = nfts.filter((nft) => {
        return nft.collection ? nft.collection.name === collection : false;
      });
      const length = items.length || 0;
      return {
        collection,
        length,
        items,
        thumb: items[0].media,
      };
    })
    .sort((a, b) => b.length - a.length);
};

const getNftsWithoutCollection = (nfts :INft[]) => nfts.filter((nft) => !nft.collection);

const getAllGroupedByCollection = async (networkId, owner) => {
  const nfts = await getAll(networkId, owner);
  const nftsByCollection = getNftsByCollection(nfts);
  const nftsWithoutCollection = getNftsWithoutCollection(nfts);
  return [...nftsByCollection, ...nftsWithoutCollection];
};

const getNftByAddress = async (mintAddress: string) :Promise<INft | undefined> => {
  try {
    const { data } : { data: INft } = await axios.get(`${SALMON_API_URL}/v1/solana/nft/${mintAddress}`);
    if (data.collection) {
      return data;
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
};

export {
  getAll,
  getAllGroupedByCollection,
  getNftByAddress,
};
