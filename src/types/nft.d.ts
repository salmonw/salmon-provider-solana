interface INftExtras {
  creators: unknown[],
  attributes: unknown[],
  properties: unknown
}

interface INftCollection {
  name: string,
}

interface INft {
  publicKey :string,
  mint :string,
  owner :string,
  name :string,
  symbol :string,
  uri :string,
  description : string,
  media :string,
  extras :INftExtras,
  collection?: INftCollection
}

export {
  INft,
  INftExtras,
};
