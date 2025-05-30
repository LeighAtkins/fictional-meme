import Head from 'next/head'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  // Enhanced scroll tracking for navbar and animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)

      // Update active section based on scroll position
      const sections = ['hero', 'about', 'projects', 'contact']
      const sectionElements = sections.map(id => document.getElementById(id))
      
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i]
        if (section && scrollPosition >= section.offsetTop - 100) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up')
          entry.target.classList.remove('opacity-0', 'translate-y-8')
        }
      })
    }, observerOptions)

    // Observe all elements with fade-in class
    const elementsToAnimate = document.querySelectorAll('.fade-in-on-scroll')
    elementsToAnimate.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    // Close mobile menu after navigation
    setMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>Leigh Atkins - Full-Stack Developer & Software Engineer Portfolio</title>
        <meta name="title" content="Leigh Atkins - Full-Stack Developer & Software Engineer Portfolio" />
        <meta name="description" content="Experienced Full-Stack Developer specializing in React, Next.js, Node.js, and modern web technologies. View my portfolio of innovative projects and professional experience." />
        <meta name="author" content="Leigh Atkins" />
        <meta name="keywords" content="Full-Stack Developer, Software Engineer, React, Next.js, Node.js, JavaScript, TypeScript, Web Development, Portfolio, Leigh Atkins" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://leighatkins.dev" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://leighatkins.dev" />
        <meta property="og:title" content="Leigh Atkins - Full-Stack Developer & Software Engineer Portfolio" />
        <meta property="og:description" content="Experienced Full-Stack Developer specializing in React, Next.js, Node.js, and modern web technologies. View my portfolio of innovative projects and professional experience." />
        <meta property="og:image" content="https://leighatkins.dev/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Leigh Atkins - Full-Stack Developer Portfolio" />
        <meta property="og:site_name" content="Leigh Atkins Portfolio" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://leighatkins.dev" />
        <meta property="twitter:title" content="Leigh Atkins - Full-Stack Developer & Software Engineer Portfolio" />
        <meta property="twitter:description" content="Experienced Full-Stack Developer specializing in React, Next.js, Node.js, and modern web technologies. View my portfolio of innovative projects and professional experience." />
        <meta property="twitter:image" content="https://leighatkins.dev/og-image.jpg" />
        <meta property="twitter:image:alt" content="Leigh Atkins - Full-Stack Developer Portfolio" />
        <meta name="twitter:creator" content="@leighatkins" />
        <meta name="twitter:site" content="@leighatkins" />
        
        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        
        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Leigh Atkins",
              "jobTitle": "Full-Stack Developer & Software Engineer",
              "description": "Experienced Full-Stack Developer specializing in React, Next.js, Node.js, and modern web technologies.",
              "url": "https://leighatkins.me",
              "image": "https://leighatkins.dev/leigh-atkins-photo.jpg",
              "sameAs": [
                "https://github.com/leighatkins",
                "https://www.linkedin.com/in/leigh-atkins-0069a731a/",
                "https://x.com/Lemonator"
              ],
              "worksFor": {
                "@type": "Organization",
                "name": "Freelance"
              },
              "knowsAbout": [
                "JavaScript",
                "TypeScript",
                "React",
                "Next.js",
                "Node.js",
                "Full-Stack Development",
                "Web Development",
                "Software Engineering"
              ],
              "alumniOf": {
                "@type": "EducationalOrganization",
                "name": "Technology Education"
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              }
            })
          }}
        />
      </Head>

      <div className="bg-gray-50 text-gray-900 font-sans">
        {/* Enhanced Navigation with Mobile Menu and Scroll Effects */}
        <nav id="navbar" className={`fixed w-full top-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50' 
            : 'bg-white/80 backdrop-blur-sm shadow-sm'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo/Name */}
              <div className="flex-shrink-0">
                <button 
                  onClick={() => scrollToSection('hero')}
                  className={`text-2xl font-bold transition-all duration-300 ${
                    isScrolled ? 'text-gray-800 hover:text-blue-600' : 'text-gray-800 hover:text-blue-600'
                  }`}
                >
                  Leigh Atkins
                </button>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  {[
                    { id: 'hero', label: 'Home' },
                    { id: 'about', label: 'About' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'contact', label: 'Contact' }
                  ].map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-3 py-2 text-sm font-medium transition-all duration-300 relative group ${
                        activeSection === item.id 
                          ? 'text-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      {item.label}
                      <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                        activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}></span>
                    </button>
                  ))}
                  <a 
                    href="/resume.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Resume
                  </a>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition duration-300"
                  aria-label="Toggle mobile menu"
                >
                  <svg
                    className={`h-6 w-6 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen 
                ? 'max-h-64 opacity-100 pb-4' 
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}>
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                <button
                  onClick={() => scrollToSection('hero')}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition duration-300"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition duration-300"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection('projects')}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition duration-300"
                >
                  Projects
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition duration-300"
                >
                  Contact
                </button>
                <a 
                  href="/resume.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full text-left px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition duration-300 mt-2"
                >
                  Resume
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          {/* Enhanced Hero Section with Professional Branding and Improved Animations */}
          <section id="hero" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 relative overflow-hidden">
            {/* Enhanced animated background decoration */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-0"></div>
              <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
              <div className="absolute bottom-10 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-2xl animate-ping animation-delay-6000"></div>
            </div>

            {/* Floating geometric shapes */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-float animation-delay-1000"></div>
              <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-purple-400 rounded-full animate-float animation-delay-3000"></div>
              <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-float animation-delay-5000"></div>
              <div className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-indigo-400 rounded-full animate-float animation-delay-7000"></div>
            </div>

            <div className="text-center px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="animate-fade-in-up animation-delay-500">
                {/* Professional Photo */}
                <div className="mb-8 flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl ring-4 ring-white ring-opacity-50 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl animate-pulse-subtle">
                      <Image
                        src="/leigh-atkins-photo.jpg"
                        alt="Leigh Atkins - Professional Photo"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        priority
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Name and Title with Staggered Animations */}
                <div className="mb-8">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-4 tracking-tight animate-fade-in-up animation-delay-700">
                    LEIGH ATKINS
                  </h1>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6 animate-fade-in-up animation-delay-900"></div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-600 mb-4 animate-fade-in-up animation-delay-1100">
                    Full-Stack Developer & Software Engineer
                  </h2>
                </div>

                {/* Professional Introduction */}
                <div className="mb-12 max-w-4xl mx-auto">
                  <p className="text-xl md:text-2xl text-gray-700 mb-6 leading-relaxed">
                    Welcome to my professional portfolio
                  </p>
                  <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                    Passionate about creating innovative digital solutions that make a difference. 
                    Specializing in modern web technologies, clean code, and exceptional user experiences.
                  </p>
                  
                  {/* Skills/Technologies Preview */}
                  <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-2xl mx-auto">
                    {['React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'AWS'].map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-white bg-opacity-80 text-gray-700 rounded-full text-sm font-medium shadow-md backdrop-blur-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Enhanced Call-to-Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button 
                    onClick={() => scrollToSection('about')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Learn About Me
                  </button>
                  <button 
                    onClick={() => scrollToSection('projects')}
                    className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 font-medium w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    View My Work
                  </button>
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="bg-gray-800 text-white px-8 py-4 rounded-full hover:bg-gray-900 transition-all duration-300 font-medium w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Get In Touch
                  </button>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced About Section with Scroll Animations */}
          <section id="about" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-16 fade-in-on-scroll opacity-0 translate-y-8 transition-all duration-700">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                  About Me
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6"></div>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Passionate developer with a love for creating innovative digital solutions
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                {/* Personal Bio */}
                <div className="fade-in-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">My Story</h3>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      I&apos;m a dedicated software engineer with expertise in modern web technologies. 
                      My journey in development began with curiosity and has evolved into a passion 
                      for creating elegant, efficient solutions.
                    </p>
                    <p>
                      With a strong foundation in both front-end and back-end development, I specialize 
                      in building scalable applications that deliver exceptional user experiences. 
                      I believe in writing clean, maintainable code and staying current with the latest 
                      industry trends and best practices.
                    </p>
                    <p>
                      When I&apos;m not coding, I enjoy exploring new technologies, contributing to open-source 
                      projects, and sharing knowledge with the developer community. I&apos;m always eager to 
                      take on new challenges and collaborate on innovative projects.
                    </p>
                  </div>
                </div>

                {/* Professional Highlights */}
                <div className="fade-in-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-400">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Professional Highlights</h3>
                  <div className="space-y-6">
                    <div className="flex items-start group">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                        <svg className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">5+ Years Experience</h4>
                        <p className="text-gray-600">Professional development experience across various technologies and industries</p>
                      </div>
                    </div>

                    <div className="flex items-start group">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors duration-300">
                        <svg className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">50+ Projects Completed</h4>
                        <p className="text-gray-600">Successfully delivered web applications, APIs, and mobile solutions</p>
                      </div>
                    </div>

                    <div className="flex items-start group">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors duration-300">
                        <svg className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Continuous Learner</h4>
                        <p className="text-gray-600">Always exploring new technologies and expanding skillset</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Skills */}
              <div className="mb-16 fade-in-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-600">
                <h3 className="text-2xl font-bold text-gray-800 text-center mb-12">Technical Skills</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Frontend */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Frontend</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['React', 'Next.js', 'Vue.js', 'TypeScript', 'Tailwind CSS'].map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Backend */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Backend</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Node.js', 'Python', 'FastAPI', 'Express', 'GraphQL'].map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Database */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3C7.58 3 4 4.79 4 7s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4zM4 9v6c0 2.21 3.58 4 8 4s8-1.79 8-4V9c0 2.21-3.58 4-8 4s-8-1.79-8-4z"/>
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Database</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase'].map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* DevOps */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">DevOps & Cloud</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['AWS', 'Docker', 'Vercel', 'Git', 'CI/CD'].map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience Summary */}
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">5+</div>
                    <div className="text-gray-600">Years of Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
                    <div className="text-gray-600">Projects Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">20+</div>
                    <div className="text-gray-600">Technologies Mastered</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Projects Portfolio Showcase with Scroll Animations */}
          <section id="projects" className="py-20 bg-gray-50 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-16 fade-in-on-scroll opacity-0 translate-y-8 transition-all duration-700">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                  Featured Projects
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6"></div>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  A showcase of my recent work and technical expertise across various technologies and domains
                </p>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                
                {/* Project Card 1 */}
                <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden fade-in-on-scroll opacity-0 translate-y-8 delay-200 hover-glow">
                  {/* Project Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-600 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                      <div className="text-white text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <p className="text-sm font-medium">Portfolio Website</p>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">Live</span>
                    </div>
                  </div>
                  
                  {/* Project Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      Professional Portfolio
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      A modern, responsive portfolio website built with Next.js and Tailwind CSS. Features smooth animations, mobile-first design, and optimized performance.
                    </p>
                    
                    {/* Technology Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['Next.js', 'React', 'Tailwind CSS', 'Vercel'].map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    {/* Project Links */}
                    <div className="flex gap-3">
                      <a 
                        href="#" 
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        Live Demo
                      </a>
                      <a 
                        href="#" 
                        className="flex-1 border border-blue-600 text-blue-600 text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        Source Code
                      </a>
                    </div>
                  </div>
                </div>

                {/* Project Card 2 */}
                <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-600 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <p className="text-sm font-medium">E-Commerce App</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">In Progress</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors duration-300">
                      E-Commerce Platform
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      Full-stack e-commerce solution with user authentication, payment integration, and admin dashboard. Built with modern technologies and best practices.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['React', 'Node.js', 'PostgreSQL', 'Stripe API'].map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-3">
                      <a 
                        href="#" 
                        className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        Preview
                      </a>
                      <a 
                        href="#" 
                        className="flex-1 border border-green-600 text-green-600 text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600 hover:text-white transition-colors duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>

                {/* Project Card 3 */}
                <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-600 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                        </svg>
                        <p className="text-sm font-medium">API Service</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">Completed</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                      RESTful API Service
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      Scalable REST API with comprehensive documentation, authentication, rate limiting, and real-time features. Deployed on cloud infrastructure.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['Python', 'FastAPI', 'Docker', 'AWS'].map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-3">
                      <a 
                        href="#" 
                        className="flex-1 bg-purple-600 text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        API Docs
                      </a>
                      <a 
                        href="#" 
                        className="flex-1 border border-purple-600 text-purple-600 text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-600 hover:text-white transition-colors duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        Repository
                      </a>
                    </div>
                  </div>
                </div>

                {/* Project Card 4 */}
                <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-yellow-400 to-orange-600 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM8.5 16L12 13.5 15.5 16 12 18.5 8.5 16z"/>
                        </svg>
                        <p className="text-sm font-medium">Mobile App</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">Beta</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                      Mobile Task Manager
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      Cross-platform mobile application for task management with offline capabilities, push notifications, and cloud synchronization.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['React Native', 'TypeScript', 'Firebase', 'Redux'].map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-md font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-3">
                      <a 
                        href="#" 
                        className="flex-1 bg-orange-600 text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        TestFlight
                      </a>
                      <a 
                        href="#" 
                        className="flex-1 border border-orange-600 text-orange-600 text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 hover:text-white transition-colors duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        Code
                      </a>
                    </div>
                  </div>
                </div>

                {/* Project Card 5 */}
                <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-teal-400 to-cyan-600 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <p className="text-sm font-medium">Data Dashboard</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-medium">Live</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                      Analytics Dashboard
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      Real-time analytics dashboard with interactive charts, data visualization, and comprehensive reporting capabilities for business insights.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['Vue.js', 'D3.js', 'Python', 'MongoDB'].map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-md font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-3">
                      <a 
                        href="#" 
                        className="flex-1 bg-teal-600 text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        Live Demo
                      </a>
                      <a 
                        href="#" 
                        className="flex-1 border border-teal-600 text-teal-600 text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-teal-600 hover:text-white transition-colors duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>

                {/* Project Card 6 */}
                <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-pink-400 to-red-600 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                        <p className="text-sm font-medium">AI Assistant</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">Research</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors duration-300">
                      AI Chat Assistant
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      Intelligent chatbot powered by machine learning with natural language processing, context awareness, and multi-language support.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['Python', 'TensorFlow', 'OpenAI API', 'Flask'].map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-md font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-3">
                      <a 
                        href="#" 
                        className="flex-1 bg-red-600 text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        Try Demo
                      </a>
                      <a 
                        href="#" 
                        className="flex-1 border border-red-600 text-red-600 text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-600 hover:text-white transition-colors duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        Research
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <p className="text-lg text-gray-600 mb-6">
                  Interested in working together or learning more about my projects?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Get In Touch
                  </button>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="border-2 border-gray-800 text-gray-800 px-8 py-3 rounded-full hover:bg-gray-800 hover:text-white transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    View All Projects
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Contact Section with Professional Styling and Animations */}
          <section id="contact" className="py-20 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-16 fade-in-on-scroll opacity-0 translate-y-8 transition-all duration-700">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                  Let&apos;s Connect
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6"></div>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Ready to collaborate? I&apos;d love to hear about your project and explore how we can work together.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Contact Information */}
                <div className="fade-in-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-8">Get In Touch</h3>
                  
                  {/* Contact Methods */}
                  <div className="space-y-6">
                    <div className="flex items-center group hover-lift">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-all duration-300 group-hover:scale-110">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">Email</h4>
                        <a href="mailto:contact@leighatkins.dev" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
                          contact@leighatkins.dev
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center group hover-lift">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-all duration-300 group-hover:scale-110">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 1H8C6.34 1 5 2.34 5 4v16c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3zM14 21h-4v-1h4v1zm1.25-3H8.75V4h6.5v14z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors duration-300">Phone</h4>
                        <a href="tel:+1234567890" className="text-gray-600 hover:text-green-600 transition-colors duration-300">
                          +1 (234) 567-8900
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center group hover-lift">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-all duration-300 group-hover:scale-110">
                        <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">Location</h4>
                        <p className="text-gray-600">Available for remote work worldwide</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Follow Me</h4>
                    <div className="flex space-x-4">
                      <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg" onClick={(e) => e.preventDefault()}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                      <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-800 hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg" onClick={(e) => e.preventDefault()}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        placeholder="john.doe@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      >
                        <option value="">Please select a subject</option>
                        <option value="project">Project Inquiry</option>
                        <option value="collaboration">Collaboration</option>
                        <option value="freelance">Freelance Work</option>
                        <option value="employment">Employment Opportunity</option>
                        <option value="consultation">Consultation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                        Project Budget (Optional)
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      >
                        <option value="">Select budget range</option>
                        <option value="under-5k">Under $5,000</option>
                        <option value="5k-10k">$5,000 - $10,000</option>
                        <option value="10k-25k">$10,000 - $25,000</option>
                        <option value="25k-50k">$25,000 - $50,000</option>
                        <option value="over-50k">Over $50,000</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 resize-vertical"
                        placeholder="Tell me about your project, timeline, requirements, or any questions you have..."
                      ></textarea>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="agreement"
                          name="agreement"
                          type="checkbox"
                          required
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="agreement" className="text-gray-600">
                          I agree to the{' '}
                          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                            Privacy Policy
                          </a>{' '}
                          and{' '}
                          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                            Terms of Service
                          </a>
                          . *
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Send Message
                    </button>

                    <p className="text-sm text-gray-500 text-center">
                      I typically respond within 24 hours. All information is kept confidential.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Enhanced Footer Section */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              
              {/* Brand & Description */}
              <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold mb-4">Leigh Atkins</h3>
                <p className="text-gray-300 mb-6 max-w-md">
                  Full-Stack Developer & Software Engineer passionate about creating innovative 
                  digital solutions that make a difference. Let&apos;s build something amazing together.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-gray-300 text-sm">Available for new projects</span>
                </div>
              </div>

              {/* Quick Navigation */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-3">
                  <li>
                    <button 
                      onClick={() => scrollToSection('hero')}
                      className="text-gray-300 hover:text-white transition-colors duration-300 block text-left"
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('about')}
                      className="text-gray-300 hover:text-white transition-colors duration-300 block text-left"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('projects')}
                      className="text-gray-300 hover:text-white transition-colors duration-300 block text-left"
                    >
                      Projects
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('contact')}
                      className="text-gray-300 hover:text-white transition-colors duration-300 block text-left"
                    >
                      Contact
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Get In Touch</h4>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <span className="text-gray-300 text-sm">hello@leighatkins.dev</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-gray-300 text-sm">Available Worldwide</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-gray-300 text-sm">24h Response Time</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Social Media & Bottom Section */}
            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                
                {/* Social Media Links */}
                <div className="flex items-center space-x-6">
                  <span className="text-gray-400 text-sm">Follow me:</span>
                  <div className="flex space-x-4">
                    <a 
                      href="https://github.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors duration-300 group"
                      aria-label="GitHub"
                    >
                      <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                    
                    <a 
                      href="https://linkedin.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors duration-300 group"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-5 h-5 text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    
                    <a 
                      href="https://twitter.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-blue-400 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-colors duration-300 group"
                      aria-label="Twitter"
                    >
                      <svg className="w-5 h-5 text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>

                    <a 
                      href="#" 
                      className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center transition-colors duration-300 group"
                      aria-label="Portfolio"
                    >
                      <svg className="w-5 h-5 text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Copyright & Legal */}
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
                  <span>© 2024 Leigh Atkins. All rights reserved.</span>
                  <div className="flex space-x-4">
                    <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a>
                  </div>
                </div>
              </div>

              {/* Back to Top */}
              <div className="mt-8 text-center">
                <button 
                  onClick={() => scrollToSection('hero')}
                  className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <span className="text-sm">Back to Top</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 