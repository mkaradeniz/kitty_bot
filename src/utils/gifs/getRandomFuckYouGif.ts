import { sample } from 'lodash';

const GIFS = [
  'https://media1.giphy.com/media/dIBzteMy7M5H6iy7CX/giphy.gif?cid=790b761109a8d3ff6790e885fdc6b4e58e56b4bb9d918aec&rid=giphy.gif&ct=g',
  'https://media1.giphy.com/media/w1XrYq5PsCbyE/giphy.gif?cid=790b76110d7f1e542e91ae6fa0ce968fb277b4328d1a20e7&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/KzGCAlMiK6hQQ/giphy.gif?cid=790b761152bc1c2e5b668ec7dcc085cec3d0a95a7c3f34f9&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/yV5xcSTmtVPBS/giphy.gif?cid=790b7611359aa259a613738ca2241085f2c68157b60fe031&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/XHr6LfW6SmFa0/giphy.gif?cid=790b7611912c2e60fcada35c8aa7887965461c7f6e59382e&rid=giphy.gif&ct=g',
];

export const getRandomFuckYouGif = () => {
  return sample(GIFS) as string;
};
