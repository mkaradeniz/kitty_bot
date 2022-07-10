import { sample } from 'lodash';

const GIFS = [
  'https://media2.giphy.com/media/3oz8xtprbtd0wEWOoU/giphy.gif?cid=790b761127e883a8d7d2d01c27a520ab08b821bd617952c9&rid=giphy.gif&ct=g',
  'https://media3.giphy.com/media/cbEK5zFlH5rVu/giphy.gif?cid=790b7611d59c0854032039b9c6bd25df27d6bc21180e2cf5&rid=giphy.gif&ct=g',
  'https://media1.giphy.com/media/11NEJQ3pJn7Nkc/giphy.gif?cid=790b7611b71f0957a3affb509b7236c87feacb2f0320c922&rid=giphy.gif&ct=g',
];

const getRandomRejectedGif = () => {
  return sample(GIFS) as string;
};

export default getRandomRejectedGif;
