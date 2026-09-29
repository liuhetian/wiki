export type Track = {
  id: string
  title: string
  duration: string
}

export type Album = {
  id: string
  title: string
  artist: string
  year: string
  genre: string
  primary: string
  secondary: string
  ink: string
  motif: 'orbit' | 'grid' | 'wave' | 'sun' | 'type' | 'cutout'
  tracks: Track[]
}

const titles = [
  'Soft Machinery', 'Plastic Weather', 'Night Orchard', 'Mango Radio',
  'Postcards to Orbit', 'Blue Static', 'Parallel Cinema', 'Borrowed Light',
  'Slow Geometry', 'Heat Mirage', 'After the Signal', 'Tiny Revolutions',
]

const artists = [
  'Mira Vale', 'Common Room', 'Noon Service', 'The Small Hours',
  'Pale Telephone', 'Daybed Club', 'Paper Satellites', 'Lemon District',
  'Hotel Pacific', 'June Archive', 'The Local Echo', 'Sunday Driver',
]

const palettes = [
  ['#f24f2d', '#13b8a6', '#11100f'], ['#2139db', '#ffbd2e', '#f5ecdf'],
  ['#1b2029', '#d6ff45', '#f4f1e8'], ['#17a99e', '#ff6d2e', '#141414'],
  ['#f1eee7', '#f14f43', '#131313'], ['#62a7db', '#18154c', '#f6f0df'],
  ['#65265b', '#f3cdd3', '#fff4e2'], ['#d4d4bd', '#334f3f', '#151515'],
  ['#e95c69', '#202f4c', '#f1e4c9'], ['#efb524', '#401e37', '#120f0c'],
  ['#0f605c', '#121720', '#f5e8ce'], ['#dfded8', '#df2d35', '#161616'],
]

const trackNames = [
  'Intro', 'Borrowed Light', 'Good Weather', 'Two Rooms', 'Soft Focus',
  'All at Once', 'Little Signals', 'Before Dawn', 'Satellite Heart', 'Outro',
  'Sorry Sorry', 'Money Money', 'Light', 'Hanabi', 'Tengil Aku',
  'Love River', 'Nyoom', 'Crazy Paradise', 'Burning Heart', 'Before Dawn II',
  'Little Fish', 'Mayday Mayday', 'Acoustic Version', 'Instrumental I',
  'Instrumental II', 'Afterimage', 'Night Bus', 'Tasting Loneliness',
  'Signal Return', 'Bitter Sweet',
]

export const albums: Album[] = titles.map((title, index) => ({
  id: `album-${index + 1}`,
  title,
  artist: artists[index],
  year: String(2015 + (index % 10)),
  genre: ['Alternative', 'Electronic', 'Indie Pop', 'Art Rock'][index % 4],
  primary: palettes[index][0],
  secondary: palettes[index][1],
  ink: palettes[index][2],
  motif: (['orbit', 'grid', 'wave', 'sun', 'type', 'cutout'] as const)[index % 6],
  tracks: trackNames.slice(0, index === 4 ? 30 : index === 7 ? 22 : 10).map((name, trackIndex) => ({
    id: `album-${index + 1}-track-${trackIndex + 1}`,
    title: trackIndex === 0 ? name : `${name}${index % 3 === 0 && trackIndex === 4 ? ' (Reprise)' : ''}`,
    duration: `${2 + ((index + trackIndex) % 3)}’${String(12 + ((index * 7 + trackIndex * 13) % 46)).padStart(2, '0')}”`,
  })),
}))
