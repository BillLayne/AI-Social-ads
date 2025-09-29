import { ArtisticStyle } from '../types';

export interface StylePreset {
  id: ArtisticStyle;
  name: string;
  imageUrl: string;
}

export const stylePresets: StylePreset[] = [
  {
    id: ArtisticStyle.PHOTOREALISTIC,
    name: 'Photorealistic',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&h=400&fit=crop&crop=faces',
  },
  {
    id: ArtisticStyle.CARTOON,
    name: 'Cartoon',
    imageUrl: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/caec06443d05dc921d6d2dc227fa2d4975256f89/Blog%20Images/cartoon%20style%20example.990Z.png',
  },
  {
    id: ArtisticStyle.VINTAGE,
    name: 'Vintage',
    imageUrl: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/0eedc129fc45a8629ccb20646d1ca357868d4610/Blog%20Images/vintage%20example.707Z.png',
  },
  {
    id: ArtisticStyle.SURREAL,
    name: 'Surreal',
    imageUrl: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/0eedc129fc45a8629ccb20646d1ca357868d4610/Blog%20Images/surreal%20image.562Z.png',
  },
  {
    id: ArtisticStyle.MINIMALIST,
    name: 'Minimalist',
    imageUrl: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/0eedc129fc45a8629ccb20646d1ca357868d4610/Blog%20Images/minimalist%20style.148Z.png',
  },
  {
    id: ArtisticStyle.THREE_D_RENDER,
    name: '3D Render',
    imageUrl: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/0eedc129fc45a8629ccb20646d1ca357868d4610/Blog%20Images/save%20as%203d%20render.525Z.png',
  },
  {
    id: ArtisticStyle.PIXAR,
    name: 'Pixar',
    imageUrl: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/0eedc129fc45a8629ccb20646d1ca357868d4610/Blog%20Images/pixar%20example.511Z.png',
  },
  {
    id: ArtisticStyle.CARICATURE,
    name: 'Caricature',
    imageUrl: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/0eedc129fc45a8629ccb20646d1ca357868d4610/Blog%20Images/caricature%20example.473Z.png',
  },
  {
    id: ArtisticStyle.ACTION_FIGURE,
    name: 'Action Figure',
    imageUrl: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/0eedc129fc45a8629ccb20646d1ca357868d4610/Blog%20Images/action%20figure.347Z.png',
  },
];
