import { sample } from 'lodash';

const GIFS = [
  'https://media4.giphy.com/media/3pZipqyo1sqHDfJGtz/giphy.gif?cid=790b7611fe35d09ea8a74e3f6e7fd1699b40ded52de8f068&rid=giphy.gif&ct=g',
  'https://media1.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif?cid=790b76111305963417d82ee8eadc28d8fe7ac2ff03480bed&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/icUEIrjnUuFCWDxFpU/giphy.gif?cid=790b76111086445dbcd1d282287ea9389ca6fdf754e62ba4&rid=giphy.gif&ct=g',
  'https://media3.giphy.com/media/FBeSx3itXlUQw/giphy.gif?cid=790b76111485eac9045ec897d7ccbe64b97a1e7da4fb4bae&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/13TXV4kfn7r2iA/giphy.gif?cid=790b761116a41977851ddba024e50119f587ba5f4a1986b4&rid=giphy.gif&ct=g',
  'https://media0.giphy.com/media/l4FGwVFOEjbd73sHK/giphy.gif?cid=790b7611f50c481120b80b70e9f5cefdc547e32dea95ad18&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/3oz8xTAJIQD6JWfTUc/giphy.gif?cid=790b7611973b0366ae4b4dfa7a426ef44fe76b5317b6de79&rid=giphy.gif&ct=g',
  'https://media3.giphy.com/media/l0MYSQBX0VVocpHri/giphy.gif?cid=790b7611c56cc19c0c303954aa7dfcf62f0958e681312f2d&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/pcwaLYOQb3xN6/giphy.gif?cid=790b7611c6e165dea4c5609ea7518cad11bc85b7a0c68012&rid=giphy.gif&ct=g',
  'https://media3.giphy.com/media/2f7RQiiWMJc40/giphy.gif?cid=790b761158a0077da2a9861a0eab4ca7072725d521765daa&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/H4cFwhrrcYZiX4vKgq/giphy.gif?cid=790b76114d13b49e2bb7386c635876f4607929f50d06b743&rid=giphy.gif&ct=g',
  'https://media3.giphy.com/media/dCj054Utb30RO/giphy.gif?cid=ecf05e47udn5ipnnwouozoc2x3murudyt8nouiisgi3jzl83&rid=giphy.gif&ct=g',
];

const getRandomBenchedGif = () => {
  return sample(GIFS) as string;
};

export default getRandomBenchedGif;
