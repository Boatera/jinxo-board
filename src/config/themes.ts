export interface ThemeOption {
  id: string;
  name: string;
  gradient: string;
  border: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: 'green',
    name: 'Green',
    gradient: 'linear-gradient(155deg, #2E9B5F 0%, #1E6B40 100%)',
    border: '#1E6B40',
  },
  {
    id: 'red',
    name: 'Red',
    gradient: 'linear-gradient(155deg, #E53935 0%, #B71C1C 100%)',
    border: '#B71C1C',
  },
  {
    id: 'purple',
    name: 'Purple',
    gradient: 'linear-gradient(155deg, #7B1FA2 0%, #4A148C 100%)',
    border: '#E01C8E',
  },
  {
    id: 'yellow',
    name: 'Yellow',
    gradient: 'linear-gradient(155deg, #FBC02D 0%, #F57F17 100%)',
    border: '#F57F17',
  },
  {
    id: 'blue',
    name: 'Blue',
    gradient: 'linear-gradient(155deg, #00A3DA 0%, #0077B6 100%)',
    border: '#1E2974',
  },
  {
    id: 'grey',
    name: 'Grey',
    gradient: 'linear-gradient(155deg, #78909C 0%, #37474F 100%)',
    border: '#263238',
  },
];
