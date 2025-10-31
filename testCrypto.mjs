import {createHash} from 'crypto';

const hash = createHash('sha256');

// hash.update('asd');
// hash.update('123');
// console.log(hash.digest('hex'));

// function getRandomInt(min, max) {
//   min = Math.ceil(min);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// // Example: Generate a random integer between 1 and 10 (inclusive)
// const randomInteger = getRandomInt(3, 9);
// console.log(randomInteger); // e.g., 7


function ok () {
  hash.update('asd');
  hash.update('123');
  console.log(typeof(hash.digest('hex')));
}

ok();
// ok();