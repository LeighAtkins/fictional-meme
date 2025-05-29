import Head from 'next/head'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import About from '../components/About'
import Projects from '../components/Projects'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Head>
        <title>Leigh Atkins - Portfolio</title>
        <meta name="description" content="Leigh Atkins - Professional Portfolio showcasing skills, projects, and experience" />
        <meta name="author" content="Leigh Atkins" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-gray-50 text-gray-900 font-sans">
        <Navigation />
        
        <main>
          <Hero />
          <About />
          <Projects />
          <Contact />
        </main>

        <Footer />
      </div>
    </>
  )
} 