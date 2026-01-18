/**
 * Common Swedish First Names
 */
export const FIRST_NAMES = {
  male: ['Lars', 'Mikael', 'Anders', 'Johan', 'Erik', 'Per', 'Karl', 'Thomas', 'Jan', 'Daniel', 'Fredrik', 'Hans', 'Peter', 'Stefan', 'Magnus', 'Mats', 'Nils', 'Bengt', 'Bo', 'Sven'],
  female: ['Maria', 'Anna', 'Margareta', 'Elisabeth', 'Eva', 'Birgitta', 'Kristina', 'Karin', 'Lena', 'Marie', 'Ingrid', 'Sara', 'Sofia', 'Kerstin', 'Marianne', 'Annika', 'Susanne', 'Monica', 'Ulla', 'Gunilla']
};

/**
 * Common Swedish Last Names
 */
export const LAST_NAMES = [
  'Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson',
  'Pettersson', 'Jonsson', 'Jansson', 'Hansson', 'Bengtsson', 'Jönsson', 'Lindberg', 'Jakobsson', 'Magnusson', 'Olofsson'
];

/**
 * Company Name Components - Abstract/Fictional to avoid collisions
 */
export const COMPANY_PREFIXES = [
  'Acme', 'Omega', 'Sigma', 'Delta', 'Nova', 'Vertex', 'Apex', 'Flux', 'Ion', 'Chronos', 
  'Aethel', 'Korp', 'Lumina', 'Zenith', 'Nexus', 'Terra', 'Aero', 'Hydra', 'Velox', 'Orion'
];

export const COMPANY_SUFFIXES = [
  'Solutions', 'Systems', 'Logistics', 'Consulting', 'Group', 'Partners', 'Holdings', 'Innovations', 
  'Dynamics', 'Ventures', 'Enterprises', 'Industries', 'Technologies', 'Services', 'Strategies', 'Concepts', 'Works', 'Labs'
];

/**
 * Common Swedish Banks
 */
export const BANKS = [
  'SEB', 'Swedbank', 'Handelsbanken', 'Nordea', 'Danske Bank', 'Länsförsäkringar', 'Skandia', 'ICA Banken', 'SBAB'
];

export function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}