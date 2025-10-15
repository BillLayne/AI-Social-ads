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

export enum Platform {
  INSTAGRAM = "Instagram",
  FACEBOOK = "Facebook",
  LINKEDIN = "LinkedIn",
  X_TWITTER = "X/Twitter",
  TIKTOK = "TikTok",
}

export enum OutputType {
  IMAGE = "Image",
  VIDEO = "Video",
}

export enum TargetAudience {
  GEN_Z = "Gen Z (18-26)",
  MILLENNIALS = "Millennials (27-42)",
  GEN_X = "Gen X (43-58)",
  BOOMERS = "Boomers (59+)",
}

export interface AdCreative {
  prompt: string;
  adCopy: string;
  aspectRatio: AspectRatio;
  artisticStyle: ArtisticStyle;
  numberOfImages: number;
  platform: Platform;
  outputType: OutputType;
  targetAudience: TargetAudience;
}

export interface SocialMediaCopy {
  caption: string;
  emojis: string;
  hashtags: string;
  cta: string;
}

export interface AdIdea {
  prompt: string;
  caption: string;
  emoji: string;
  hashtag: string;
  altDescription: string;
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface TrendingAdIdeasResponse {
    ideas: AdIdea[];
    sources: GroundingSource[];
}