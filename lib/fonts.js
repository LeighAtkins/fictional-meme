import { Archivo, Cinzel, Luckiest_Guy, Oswald, Rajdhani, Share_Tech_Mono } from 'next/font/google'

// One face per game, plus Archivo for the shelf and for reading
export const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--f-archivo', display: 'swap' })
export const cinzel = Cinzel({ subsets: ['latin'], weight: ['600', '700'], variable: '--f-cinzel', display: 'swap' })
export const luckiest = Luckiest_Guy({ subsets: ['latin'], weight: '400', variable: '--f-luckiest', display: 'swap' })
export const oswald = Oswald({ subsets: ['latin'], weight: ['400', '600'], variable: '--f-oswald', display: 'swap' })
export const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--f-rajdhani', display: 'swap' })
export const techMono = Share_Tech_Mono({ subsets: ['latin'], weight: '400', variable: '--f-mono', display: 'swap' })

export const fontVars = [archivo, cinzel, luckiest, oswald, rajdhani, techMono].map((f) => f.variable).join(' ')
