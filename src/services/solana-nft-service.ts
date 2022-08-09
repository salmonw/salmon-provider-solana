import axios from 'axios';
import { SALMON_API_URL } from '../constants/solana-constants';

const getAll = async (networkId, publicKey, noCache = false) => {
  const params = { publicKey, noCache };
  const response = await axios.get(`${SALMON_API_URL}/v1/solana/nft`, {
    params,
    headers: { 'X-Network-Id': networkId },
  });
  return response.data;
};

const getAllGroupedByCollection = async (networkId, owner) => {
  const nfts = await getAll(networkId, owner);
  const nftsByCollection = getNftsByCollection(nfts);
  const nftsWithoutCollection = getNftsWithoutCollection(nfts);
  return [...nftsByCollection, ...nftsWithoutCollection];
};

const getCollections = (nfts) => {
  const collections = nfts.map((nft) => nft.collection?.name).filter((e) => e !== undefined);
  return Array.from(new Set(collections));
};

const getNftsByCollection = (nfts) => {
  const collections = getCollections(nfts);
  return collections
    .map((collection) => {
      const items = nfts.filter((nft) => nft.collection?.name === collection);
      const length = items.length;
      return {
        collection,
        length,
        items,
        thumb: items[0].media,
      };
    })
    .sort((a, b) => b.length - a.length);
};

const getNftsWithoutCollection = (nfts) => {
  return nfts.filter((nft) => !nft.collection);
};

export {
  getAll,
  getAllGroupedByCollection,
};
