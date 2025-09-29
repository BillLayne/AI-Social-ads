
export enum AspectRatio {
  SQUARE = "1:1",
  VERTICAL = "9:16",
}

export interface AdCreative {
  prompt: string;
  adCopy: string;
  aspectRatio: AspectRatio;
}

export interface SocialMediaCopy {
  caption: string;
  emojis: string;
  hashtags: string;
}
