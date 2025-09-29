export enum AspectRatio {
  SQUARE = "1:1",
  VERTICAL = "9:16",
}

export enum ArtisticStyle {
  PHOTOREALISTIC = "Photorealistic",
  CARTOON = "Cartoon",
  VINTAGE = "Vintage",
  SURREAL = "Surreal",
  MINIMALIST = "Minimalist",
  THREE_D_RENDER = "3D Render",
  PIXAR = "Pixar",
  CARICATURE = "Caricature",
  ACTION_FIGURE = "Action Figure",
}

export interface AdCreative {
  prompt: string;
  adCopy: string;
  aspectRatio: AspectRatio;
  artisticStyle: ArtisticStyle;
  numberOfImages: number;
}

export interface SocialMediaCopy {
  caption: string;
  emojis: string;
  hashtags: string;
}
