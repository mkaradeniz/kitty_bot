import { sample } from 'lodash';

const GIFS = [
  'https://media1.giphy.com/media/11NEJQ3pJn7Nkc/giphy.gif?cid=790b7611b71f0957a3affb509b7236c87feacb2f0320c922&rid=giphy.gif&ct=g',
  'https://media1.giphy.com/media/3orieNBF6NNTqUbVks/giphy.gif?cid=790b761124b304bd6fd2490b32f91c55534081673e79ffee&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/3oz8xtprbtd0wEWOoU/giphy.gif?cid=790b761127e883a8d7d2d01c27a520ab08b821bd617952c9&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/xUA7b9bKedmvSRla4U/giphy.gif?cid=790b76114e8f449dd0388e5cd9993062dc29c6b45fd780d1&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/xUNd9zrGpXenbgLh7y/giphy.gif?cid=790b7611190c69be10d0c2859428ea743b0573189863e2f2&rid=giphy.gif&ct=g',
  'https://media3.giphy.com/media/cbEK5zFlH5rVu/giphy.gif?cid=790b7611d59c0854032039b9c6bd25df27d6bc21180e2cf5&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/L4W8uAyuwSyqs/giphy.gif?cid=790b7611a05ed32e08fc58fecf440c5f507dabd1f41beb50&rid=giphy.gif&ct=g',
];

export const getRandomBenchedGif = () => {
  return sample(GIFS) as string;
};
