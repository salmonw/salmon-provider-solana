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

const getCollections = (nfts: INft[]):string[] => {
  const collections = nfts.map((nft) => nft.collection.name).filter((e) => e !== undefined);
  return Array.from(new Set(collections));
};

const getNftsByCollection = (nfts: INft[]) => {
  const collections = getCollections(nfts);
  return collections
    .map((collection) => {
      const items = nfts.filter((nft) => nft.collection.name === collection);
      const { length } = items;
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

export {
  getAll,
  getAllGroupedByCollection,
};
