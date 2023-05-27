//list 50 cute/funny animals
const animals = [
  'alligator',
  'anteater',
  'armadillo',
  'auroch',
  'axolotl',
  'badger',
  'bat',
  'beaver',
  'buffalo',
  'camel',
  'capybara',
  'chameleon',
  'cheetah',
  'chinchilla',
  'chipmunk',
  'chupacabra',
  'cormorant',
  'coyote',
  'crow',
  'dingo',
  'dinosaur',
  'dolphin',
  'duck',
  'elephant',
  'ferret',
  'fox',
  'frog',
  'giraffe',
  'gopher',
  'grizzly',
  'hedgehog',
  'hippo',
  'hyena',
  'ibex',
  'ifrit',
  'iguana',
  'jackal',
  'kangaroo',
  'koala',
  'kraken',
  'lemur',
  'leopard',
  'liger',
  'llama',
  'manatee',
  'mink',
  'monkey',
  'moose',
  'narwhal',
  'orangutan',
  'otter',
  'panda',
  'penguin',
  'platypus',
  'python',
  'quagga',
  'rabbit',
  'raccoon',
  'rhino',
  'sheep',
  'shrew',
  'skunk',
  'squirrel',
  'tiger',
  'turtle',
  'walrus',
  'wolf',
  'wolverine',
  'wombat',
];

//list 50 cute/funny adjectives
const adjectives = [
  'adorable',
  'beautiful',
  'clean',
  'drab',
  'elegant',
  'fancy',
  'glamorous',
  'handsome',
  'long',
  'magnificent',
  'old-fashioned',
  'plain',
  'quaint',
  'sparkling',
  'fierce',
  'itchy',
  'mysterious',
  'agreeable',
  'brave',
  'calm',
  'delightful',
  'eager',
  'faithful',
  'gentle',
  'happy',
  'jolly',
  'kind',
  'lively',
  'nice',
  'proud',
  'silly',
  'thankful',
  'witty',
  'zealous',
];

const generateUsername = () => {
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];

  return toTitleCase(`${adjective} ${animal}`);
};

const FirstLetters = /\b(\w)/g;

const toTitleCase = (str: string) => {
  return str.replace(FirstLetters, (firstLetter) => firstLetter.toUpperCase());
};

import { randomUUID } from 'crypto';

const generateUserId = () => {
  return randomUUID().toString();
};

const generateUser = (location: ZoneLocation) => {
  return {
    userId: generateUserId(),
    username: generateUsername(),
    location: location,
  };
};

export { generateUser, generateUserId, generateUsername };

type ZoneLocation = {
  lat: number;
  lng: number;
};
