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

//list 30 different css color hex codes that fulfills the following criteria:
// 2. The color must not be a shade of gray
// 3. The color must not be a shade of white
// 4. The color must not be a shade of black
// 5. The color must fulfill the WCAG contrast ratio of 4.5:1 on a light background
// 6. The color must not be too bright
//list a rainbow of dark colors
const colorHexCodes = [
  '#D22C2C',
  '#CC0066',
  '#b36c24',
  '#875202',
  '#b39003',
  '#5c7a03',
  '#009933',
  '#006600',
  '#018041',
  '#028766',
  '#009999',
  '#006666',
  '#0099CC',
  '#003366',
  '#660099',
  '#663399',
  '#5e027c',
  '#7c035e',
  '#844284',
  '#996699',
  '#663333',
  '#663300',
  '#996633',
  '#9c7e60',
  '#c1734b',
  '#b54a03',
  '#c02903',
  '#823434',
  '#bb693f',
  '#00008B',
  '#000080',
  '#000000',
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
    userColor: generateUserColor(),
    location: location,
  };
};

const generateUserColor = (index?: number) => {
  return colorHexCodes[
    index ?? Math.floor(Math.random() * colorHexCodes.length)
  ];
};

export { generateUser, generateUserId, generateUsername, generateUserColor };

type ZoneLocation = {
  lat: number;
  lng: number;
};
