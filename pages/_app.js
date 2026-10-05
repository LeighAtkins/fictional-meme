import { Barlow, Barlow_Semi_Condensed, Barlow_Condensed } from 'next/font/google'
import '../src/input.css'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-barlow',
})

const barlowSemi = Barlow_Semi_Condensed({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-barlow-semi',
})

const barlowCond = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-barlow-cond',
})

function MyApp({ Component, pageProps }) {
  return (
    <div className={`${barlow.variable} ${barlowSemi.variable} ${barlowCond.variable} font-sans`}>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
