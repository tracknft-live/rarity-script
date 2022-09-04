export interface TraitCount {
  [key: string]: number;
}
export interface Traits {
  [key: string]: TraitCategories;
}
export interface GameStopNFT {
  amount: string;
  metadataJson: MetadataJSON;
  rarity?: Rarity;
}
interface Attribute {
  value: string;
  trait_type: string;
}
interface MetadataJSON {
  attributes: Attribute[];
}
interface Rarity {
  traitsCount: number;
  score: number;
  topPercent?: number;
  scores: SCORE[];
}
interface SCORE {
  type: string;
  value: string;

  // Percentage of occurrence of the trait
  occPercent: number;

  // Number of occurrence of the trait
  occCount: number;
  score: number;
}

interface TraitCategories {
  count: number;
  value: TraitValues;
}

interface TraitValue {
  count: number;
}

interface TraitValues {
  [key: string]: TraitValue;
}
