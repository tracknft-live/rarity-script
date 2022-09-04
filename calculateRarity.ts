import { GameStopNFT, TraitCount, Traits } from "./interface";

// Function to calculate the rarity of Gamestop NFT
// Created & Used by https://www.tracknft.live/
const calculateRarity = (nfts: GameStopNFT[]) => {
  // Prepare the traits object to gather the stats about the available traits in the NFTs
  const traits: Traits = {};

  // Prepare the trait count object to gather the stats about the number of traits per NFTs
  const traitCount: TraitCount = {};

  // to ensure the calculation takes in account the total of NFT & Editions available
  // Gather rarity stats from all NFTs
  // Set NFT Count variable to get the number of NFT and their editions
  const { NFTCount } = prepareNFTStats(nfts, traits, traitCount);

  // Calculate the rarity score per NFT
  calculateNFTSRarity(nfts, traits, traitCount, NFTCount);

  // Calculate the rarity score per NFT
  calculateTopRanking(nfts, traits, traitCount, NFTCount);

  // Sort NFTs by score
  nfts.sort((a: any, b: any) => b.rarity.score - a.rarity.score);

  // Get all score in one array
  let scores = nfts.map((e: any, i: any) => {
    return e?.rarity?.score || 0;
  });

  nfts = nfts.map((e: any, i: any) => {
    return {
      ...e,
      rarity: {
        ...e.rarity,
        rank: scores.findIndex((s: any) => (e?.rarity?.score || 0) === s) + 1,
      },
    };
  });

  return { nfts, traits };
};

const prepareNFTStats = (
  nfts: GameStopNFT[],
  traits: Traits,
  traitCount: TraitCount
) => {
  let NFTCount = 0;

  for (let nft of nfts) {
    // Get all attributes
    const attributes = nft.metadataJson.attributes;

    // Prepare the rarity object to add to the NFT
    nft.rarity = {
      traitsCount: attributes.length || 0,
      score: 0,
      scores: [],
    };

    // Increment the number of edition of this NFT for the global counter
    // to calculate accurately
    NFTCount += parseInt(nft.amount);

    // Create to key for the number of traits
    const traitNumber = `trait-count-${attributes.length}`;

    // Make sure to instantiate it if it doesn't exist
    if (!traitCount[traitNumber]) {
      traitCount[traitNumber] = 0;
    }

    // Increment the trait count using the number of edition
    traitCount[traitNumber] += parseInt(nft.amount);

    // Loop into all attributes of the NFT
    for (let attribute of attributes) {
      // If the value doesn't exist, set it to None by default
      let attr_value = attribute.value || "None";

      // Instantiate the trait type type if the type type doesn't exist yet
      if (attribute.trait_type && !traits[attribute.trait_type]) {
        traits[attribute.trait_type] = {
          count: 0,
          value: {},
        };
      }

      // Increment the count using the number of edition
      traits[attribute.trait_type].count += parseInt(nft.amount);

      // If the trait value doesn't exist, add it
      if (attr_value && !traits[attribute.trait_type].value[attr_value]) {
        traits[attribute.trait_type].value[attr_value] = {
          count: 0,
        };
      }

      // Increment the trait value count using the number of edition
      traits[attribute.trait_type].value[attr_value].count += parseInt(
        nft.amount
      );
    }
  }
  return { NFTCount };
};
const calculateNFTSRarity = (
  nfts: GameStopNFT[],
  traits: Traits,
  traitCount: TraitCount,
  NFTCount: number
) => {
  for (let nft of nfts) {
    // Prepare the rarityScore with a base value to 0
    let nftRarityScore = 0;
    // Get all attributes
    const attributes = nft.metadataJson.attributes;

    // Loop into all attributes of the NFT
    for (let attribute of attributes) {
      // If the value doesn't exist, set it to None by default
      let attr_value = attribute.value || "None";
      // [Rarity Score for a Trait Value] = 1 / ([Number of Items with that Trait Value] / [Total Number of Items in Collection])
      const rarity =
        traits[attribute.trait_type].value[attr_value].count / NFTCount;

      // [Rarity Score for a Trait Value] = 1 / [Trait Rarity of that Trait Value]
      const rarityScore = 1 / rarity;

      // Add the attribute to the score of the NFT
      nft.rarity?.scores.push({
        type: attribute.trait_type,
        value: attr_value,
        occPercent: parseFloat((rarity * 100).toFixed(2)),
        occCount: traits[attribute.trait_type].value[attr_value].count,
        score: rarityScore,
      });

      // Increment score from the attribute
      nftRarityScore += rarityScore;
    }

    const rarity = nft.rarity?.traitsCount
      ? traitCount[`trait-count-${nft.rarity.traitsCount}`] / NFTCount
      : 0;

    // Do not calculate the trait count score
    // const rarityScore = nft.rarity?.traitsCount ? 1 / rarity : 0;

    // Add trait count to the nft rarity
    nft.rarity?.scores.push({
      type: "traitCount",
      value: `${nft.rarity.traitsCount}`,
      occPercent: parseFloat((rarity * 100).toFixed(2)),
      occCount: traitCount[`trait-count-${nft.rarity.traitsCount}`] || 0,
      score: 0,
    });

    // If the NFT rarity exist, add the score of the NFT inside it
    if (nft.rarity) {
      nft.rarity.score = nftRarityScore;
    }
  }
};
const calculateTopRanking = (
  nfts: GameStopNFT[],
  traits: Traits,
  traitCount: TraitCount,
  NFTCount: number
) => {
  const arr = nfts.map((e) => e.rarity?.score || 0);

  const q1 = percentile(arr, 0.01);
  const q5 = percentile(arr, 0.05);
  const q10 = percentile(arr, 0.1);
  const q20 = percentile(arr, 0.2);
  const q50 = percentile(arr, 0.5);

  for (let nft of nfts) {
    if (nft.rarity) {
      if (nft.rarity.score >= q1) {
        nft.rarity.topPercent = 1;
      } else if (nft.rarity.score >= q5) {
        nft.rarity.topPercent = 5;
      } else if (nft.rarity.score >= q10) {
        nft.rarity.topPercent = 10;
      } else if (nft.rarity.score >= q20) {
        nft.rarity.topPercent = 20;
      } else if (nft.rarity.score >= q50) {
        nft.rarity.topPercent = 50;
      }
    }
  }
};

export default calculateRarity;

// Calculate the percentile of an array of number
export const percentile = (arr: number[], q: number) => {
  const sorted = arr.sort((a, b) => b - a);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};
