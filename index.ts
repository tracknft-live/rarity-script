import fs from "fs";
import calculateRarity from "./calculateRarity";

const all = JSON.parse(fs.readFileSync("./dist/nfts.json", "utf-8"));
// console.log("AA",all[0])

const arr = all.map((e: any) => e.rarityScore);

const nfts = JSON.parse(fs.readFileSync("./collection.json", "utf-8"));
const res = calculateRarity(nfts);

if (!fs.existsSync("./dist")) {
  fs.mkdirSync("./dist");
}

// Write all NFTs
// fs.writeFileSync("./dist/nfts.json", JSON.stringify(nfts));

// Write NFT with name, url, score and rank
fs.writeFileSync(
  "./dist/nfts.json",
  JSON.stringify(
    res.nfts.map((e: any) => {
      return {
        name: e.name,
        url: `https://nft.gamestop.com/token/${e.contractAddress}/${e.tokenId}`,
        rarityScore: e.rarity.score,
        rarityRank: e.rarity.rank,
        topPercent: e.rarity.topPercent,
      };
    })
  )
);
fs.writeFileSync("./dist/traits.json", JSON.stringify(res.traits));
