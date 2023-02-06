import { sample } from 'lodash';

const GIFS = [
  'https://media1.giphy.com/media/l0IxYD16t9PDEdg9q/giphy.gif?cid=790b7611eb3f8c81320bacc20988ed3a2c8ddc74f671250e&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/l0HlwtlNfAR3Iq9kQ/giphy.gif?cid=790b7611f3480ec0a27f68a824857c242ecd57ff5595dc0c&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/2DLBMAG3LWp8viYd33/giphy.gif?cid=790b76115772d6a8be7e1245554fa03bbae65164ba6da8c6&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/3ohjV3fMpmmUXhK2ju/giphy.gif?cid=790b761130321082dd7edb8d1c94c156182d55682df9613d&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/czE57x4A8axa3BlYkY/giphy.gif?cid=790b761167f55bd94d9a5d81f9e5de6870959ac1681369f3&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/nbgMIadDPr2BozmwsY/giphy.gif?cid=790b7611b6f63af8af57221dcfff79e5f8eb9e967ad701d5&rid=giphy.gif&ct=g',
];

const getRandomUnbenchedGif = () => {
  return sample(GIFS) as string;
};

export default getRandomUnbenchedGif;
