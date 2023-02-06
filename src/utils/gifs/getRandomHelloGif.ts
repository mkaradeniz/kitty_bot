import { sample } from 'lodash';

const GIFS = [
  'https://media1.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif?cid=790b76111305963417d82ee8eadc28d8fe7ac2ff03480bed&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/13TXV4kfn7r2iA/giphy.gif?cid=790b761116a41977851ddba024e50119f587ba5f4a1986b4&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/3oz8xTAJIQD6JWfTUc/giphy.gif?cid=790b7611973b0366ae4b4dfa7a426ef44fe76b5317b6de79&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif?cid=790b76118a53a00f451bc7c63c439198ad5f4dcca003cb03&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/icUEIrjnUuFCWDxFpU/giphy.gif?cid=790b76111086445dbcd1d282287ea9389ca6fdf754e62ba4&rid=giphy.gif&ct=g',
  'https://media2.giphy.com/media/jOmQmJkjcvB3Bc8CRb/giphy.gif?cid=790b761180829b3efc23a2eea0c1a6099a70911dd9684c3f&rid=giphy.gif&ct=g',
  'https://media3.giphy.com/media/1DqTRYc56JfCORj6Qq/giphy.gif?cid=790b7611f93ef348b1c1f9a366c0f49891b5b2ad26d030f8&rid=giphy.gif&ct=g',
  'https://media3.giphy.com/media/2f7RQiiWMJc40/giphy.gif?cid=790b761158a0077da2a9861a0eab4ca7072725d521765daa&rid=giphy.gif&ct=g',
  'https://media3.giphy.com/media/FBeSx3itXlUQw/giphy.gif?cid=790b76111485eac9045ec897d7ccbe64b97a1e7da4fb4bae&rid=giphy.gif&ct=g',
  'https://media3.giphy.com/media/SWoXEoE1lA0uSQcF1h/giphy.gif?cid=790b761137228fd0cee3161ee1884dd669f93b4a798f07d1&rid=giphy.gif&ct=g',
  'https://media3.giphy.com/media/dCj054Utb30RO/giphy.gif?cid=ecf05e47udn5ipnnwouozoc2x3murudyt8nouiisgi3jzl83&rid=giphy.gif&ct=g',
  'https://media3.giphy.com/media/l0MYSQBX0VVocpHri/giphy.gif?cid=790b7611c56cc19c0c303954aa7dfcf62f0958e681312f2d&rid=giphy.gif&ct=g',
  'https://media3.giphy.com/media/oQzmXr9FploiZmZshV/giphy.gif?cid=790b76116aac86798c1c41b3274cdef14a2e0b9a8568e813&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/3pZipqyo1sqHDfJGtz/giphy.gif?cid=790b7611fe35d09ea8a74e3f6e7fd1699b40ded52de8f068&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/H4cFwhrrcYZiX4vKgq/giphy.gif?cid=790b76114d13b49e2bb7386c635876f4607929f50d06b743&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/pcwaLYOQb3xN6/giphy.gif?cid=790b7611c6e165dea4c5609ea7518cad11bc85b7a0c68012&rid=giphy.gif&ct=g',
];

const getRandomBenchedGif = () => {
  return sample(GIFS) as string;
};

export default getRandomBenchedGif;
