export default function About() {
  return (
    <section id="about" className="section-padding bg-white">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            About Me
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Passionate developer with a love for creating innovative digital solutions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Bio Section */}
          <div className="animate-slide-up">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">My Story</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              I'm a dedicated software engineer with expertise in modern web technologies. 
              My journey in development began with a curiosity about how things work, 
              and has evolved into a passion for creating elegant, efficient solutions.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              I believe in writing clean, maintainable code and staying up-to-date with 
              the latest industry trends and best practices. When I'm not coding, 
              you can find me exploring new technologies or contributing to open-source projects.
            </p>
          </div>

          {/* Skills Section */}
          <div className="animate-slide-up">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Skills & Technologies</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'JavaScript',
                'React',
                'Next.js',
                'Node.js',
                'Python',
                'TypeScript',
                'Tailwind CSS',
                'MongoDB',
                'PostgreSQL',
                'Git',
                'Docker',
                'AWS'
              ].map((skill) => (
                <div 
                  key={skill}
                  className="bg-gray-50 rounded-lg p-3 text-center hover:bg-blue-50 transition duration-300"
                >
                  <span className="text-gray-700 font-medium">{skill}</span>
                </div>
              ))}
            </div>

            {/* Experience Highlights */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Experience Highlights</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Full-stack web application development
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  RESTful API design and implementation
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Database design and optimization
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Agile development methodologies
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 