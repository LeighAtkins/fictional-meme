import Head from 'next/head'
import Link from 'next/link'
import { fontVars } from '../lib/fonts'

// A wrong turn still lands somewhere that looks like the site
export default function NotFound() {
  return (
    <main
      className={fontVars}
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background: '#0b0b18',
        color: '#f1e9da',
        fontFamily: 'var(--f-archivo), system-ui, sans-serif',
        textAlign: 'center',
      }}
    >
      <Head>
        <title>Not in the box · itembox.site</title>
        <meta name="robots" content="noindex" />
        <style>{'html,body{background:#0b0b18}'}</style>
      </Head>
      <div>
        <p style={{ fontSize: '0.95rem', color: '#ff4fb0', fontWeight: 700 }}>404</p>
        <h1 style={{ marginTop: '0.4rem', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 800, fontStretch: '125%', lineHeight: 1 }}>
          That item isn’t in the box.
        </h1>
        <p style={{ marginTop: '1rem', color: '#c9c2d9' }}>The page you asked for doesn’t exist. Try one of these instead.</p>
        <p style={{ marginTop: '1.6rem', display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ padding: '0.7rem 1.3rem', borderRadius: 6, background: '#ff4fb0', color: '#1a0612', fontWeight: 800 }}>
            Back to the living room
          </Link>
          <Link href="/resume" style={{ padding: '0.7rem 1.3rem', borderRadius: 6, border: '1px solid #ff4fb0', color: '#ffd1ec', fontWeight: 700 }}>
            Read the résumé
          </Link>
        </p>
      </div>
    </main>
  )
}
