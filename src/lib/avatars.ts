// Christmas-themed animal avatars
// Each avatar has an animal with Christmas accessories

export interface Avatar {
  id: string;
  name: string;
  emoji: string;
  backgroundColor: string;
  accessory: string;
}

export const CHRISTMAS_AVATARS: Avatar[] = [
  {
    id: 'reindeer',
    name: 'Reindeer',
    emoji: '🦌',
    backgroundColor: '#8B4513',
    accessory: 'Red nose'
  },
  {
    id: 'polar-bear',
    name: 'Polar Bear',
    emoji: '🐻‍❄️',
    backgroundColor: '#E8F4F8',
    accessory: 'Santa hat'
  },
  {
    id: 'penguin',
    name: 'Penguin',
    emoji: '🐧',
    backgroundColor: '#1C1C1C',
    accessory: 'Scarf'
  },
  {
    id: 'owl',
    name: 'Snowy Owl',
    emoji: '🦉',
    backgroundColor: '#F5F5DC',
    accessory: 'Earmuffs'
  },
  {
    id: 'fox',
    name: 'Arctic Fox',
    emoji: '🦊',
    backgroundColor: '#FF6B35',
    accessory: 'Mittens'
  },
  {
    id: 'rabbit',
    name: 'Snow Bunny',
    emoji: '🐰',
    backgroundColor: '#FFB6C1',
    accessory: 'Bow'
  },
  {
    id: 'cat',
    name: 'Cozy Cat',
    emoji: '🐱',
    backgroundColor: '#FFA500',
    accessory: 'Sweater'
  },
  {
    id: 'dog',
    name: 'Jolly Pup',
    emoji: '🐶',
    backgroundColor: '#D2691E',
    accessory: 'Antlers'
  },
  {
    id: 'mouse',
    name: 'Christmas Mouse',
    emoji: '🐭',
    backgroundColor: '#C0C0C0',
    accessory: 'Cheese gift'
  },
  {
    id: 'hedgehog',
    name: 'Holly Hedgehog',
    emoji: '🦔',
    backgroundColor: '#8B7355',
    accessory: 'Holly berries'
  },
  {
    id: 'seal',
    name: 'Festive Seal',
    emoji: '🦭',
    backgroundColor: '#708090',
    accessory: 'Bell collar'
  },
  {
    id: 'otter',
    name: 'Merry Otter',
    emoji: '🦦',
    backgroundColor: '#5D4037',
    accessory: 'Candy cane'
  },
  {
    id: 'squirrel',
    name: 'Nutty Squirrel',
    emoji: '🐿️',
    backgroundColor: '#CD853F',
    accessory: 'Acorn ornament'
  },
  {
    id: 'sloth',
    name: 'Sleepy Sloth',
    emoji: '🦥',
    backgroundColor: '#9E9E6D',
    accessory: 'Pajamas'
  },
  {
    id: 'koala',
    name: 'Cuddly Koala',
    emoji: '🐨',
    backgroundColor: '#A0A0A0',
    accessory: 'Eucalyptus wreath'
  },
  {
    id: 'panda',
    name: 'Panda Claus',
    emoji: '🐼',
    backgroundColor: '#2C2C2C',
    accessory: 'Santa beard'
  }
];

/**
 * Get a random avatar that hasn't been used by existing players
 */
export function getRandomAvatar(usedAvatarIds: string[]): Avatar {
  const availableAvatars = CHRISTMAS_AVATARS.filter(
    avatar => !usedAvatarIds.includes(avatar.id)
  );

  // If all avatars are used, allow duplicates
  const avatarPool = availableAvatars.length > 0 ? availableAvatars : CHRISTMAS_AVATARS;

  const randomIndex = Math.floor(Math.random() * avatarPool.length);
  return avatarPool[randomIndex];
}

/**
 * Get an avatar by its ID
 */
export function getAvatarById(id: string): Avatar | undefined {
  return CHRISTMAS_AVATARS.find(avatar => avatar.id === id);
}
