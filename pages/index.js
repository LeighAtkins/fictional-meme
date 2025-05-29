import Head from 'next/head'

export default function Home() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

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
        {/* Navigation */}
        <nav id="navbar" className="bg-white shadow-sm fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex-shrink-0">
                <button 
                  onClick={() => scrollToSection('hero')}
                  className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition duration-300"
                >
                  Leigh Atkins
                </button>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  <button 
                    onClick={() => scrollToSection('hero')}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-300"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => scrollToSection('about')}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-300"
                  >
                    About
                  </button>
                  <button 
                    onClick={() => scrollToSection('projects')}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-300"
                  >
                    Projects
                  </button>
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-300"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          {/* Hero Section */}
          <section id="hero" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
            <div className="text-center px-4 sm:px-6 lg:px-8">
              <div className="animate-fade-in">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-6">
                  LEIGH ATKINS
                </h1>
                <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Welcome to my professional portfolio
                </p>
                <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
                  Full-Stack Developer & Software Engineer passionate about creating innovative digital solutions
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button 
                    onClick={() => scrollToSection('about')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-medium w-full sm:w-auto"
                  >
                    About Me
                  </button>
                  <button 
                    onClick={() => scrollToSection('projects')}
                    className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition duration-300 font-medium w-full sm:w-auto"
                  >
                    View Projects
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                  About Me
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Passionate developer with a love for creating innovative digital solutions
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 max-w-2xl mx-auto">
                  I&apos;m a dedicated software engineer with expertise in modern web technologies. 
                  My journey in development began with curiosity and has evolved into a passion 
                  for creating elegant, efficient solutions.
                </p>
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section id="projects" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                  Featured Projects
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  A showcase of my recent work and technical expertise
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">
                  Projects coming soon...
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                  Get In Touch
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  I&apos;m always interested in new opportunities and exciting projects
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Contact form coming soon...
                </p>
                <a 
                  href="mailto:leigh.atkins@example.com"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-medium inline-block"
                >
                  Email Me
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-300 text-sm">
                © {new Date().getFullYear()} Leigh Atkins. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 