import { Link } from 'react-router-dom';
import Navbar from '../../components/UserComponents/Navbar';
import Footer from '../../components/UserComponents/Footer';

export default function AboutUs() {
  const values = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Quality Education',
      description: 'We believe that quality education should be accessible to everyone, regardless of their background or location.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Community First',
      description: 'Building a strong community of learners, instructors, and professionals who support each other\'s growth.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Innovation',
      description: 'Constantly innovating to provide the best learning experience with cutting-edge technology and methodologies.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Trust & Transparency',
      description: 'We maintain transparency in all our operations and build trust through honest communication and reliable services.'
    }
  ];

  const team = [
    {
      name: 'Saroj Basnet',
      role: 'CEO & Founder',
      image: null,
      initials: 'JS'
    },
    {
      name: 'Swastik Nepal',
      role: 'Head of Education',
      image: null,
      initials: 'SJ'
    },
    {
      name: 'Agaman Shrestha',
      role: 'Digital Marketing Expert',
      image: null,
      initials: 'MC'
    },
    {
      name: 'Nikesh Prajuli',
      role: 'Head of Community',
      image: null,
      initials: 'ER'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-800 to-red-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About Skill Connect Pro</h1>
          <div className="text-xl md:text-2xl text-red-100 max-w-4xl mx-auto space-y-4">
            <p>
              We believe that learning should be accessible to everyone, which is why we offer the most cost-effective IT training programs available.
            </p>
            <p>
              Our organization invests heavily in student success, dedicating resources to ensure learners have the tools they need to build prosperous futures.
            </p>
            <p>
              Excellence in education is not a luxury—it is an essential right that every learner deserves to experience.
            </p>
            <p>
              Our commitment is to eliminate obstacles and ensure that tech education reaches every individual, regardless of their circumstances.
            </p>
            <p>
              Become part of our movement to make education universally available and inspire tomorrow&apos;s leaders.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-8">
              <div className="w-16 h-16 bg-red-800 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                To democratize education and bridge the gap between learning and earning by providing accessible, 
                high-quality courses that help individuals acquire in-demand skills and advance their careers.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
              <div className="w-16 h-16 bg-red-800 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                To become the world&apos;s leading platform where anyone, anywhere can learn new skills, 
                connect with opportunities, and transform their lives through education and professional development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-6">
              Skill Connect Pro was born from a simple yet powerful idea: education should be accessible, 
              practical, and directly connected to real-world opportunities. Founded in 2025, we recognized 
              the growing gap between traditional education systems and the rapidly evolving job market.
            </p>
            <p className="mb-6">
              Our platform was designed to solve the fragmentation problem in the e-learning and freelance 
              economy. We saw that professionals were struggling to manage their learning journey across 
              multiple platforms, and there was no unified ecosystem that connected skill acquisition with 
              practical application and earning opportunities.
            </p>
            <p className="mb-6">
              Today, Skill Connect Pro stands as a hybrid marketplace that seamlessly integrates e-learning 
              with freelance gig services. We&apos;ve created an ecosystem where learners can acquire new skills, 
              instructors can share their expertise, freelancers can offer services, and clients can find 
              the talent they need—all in one place.
            </p>
            <p>
              Our commitment remains steadfast: to provide affordable, high-quality education that empowers 
              individuals to learn, grow, and succeed in their chosen fields. We believe that everyone 
              deserves access to the tools and knowledge needed to build a better future.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center text-red-800 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Why Choose Skill Connect Pro?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-800 to-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Expert Instructors</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn from industry professionals and experts who bring real-world experience and 
                practical knowledge to every course.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-800 to-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Secure Platform</h3>
              <p className="text-gray-600 leading-relaxed">
                Your data and transactions are protected with industry-leading security measures 
                and transparent escrow systems for safe payments.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-800 to-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Integrated Ecosystem</h3>
              <p className="text-gray-600 leading-relaxed">
                Seamlessly connect learning with earning. Apply new skills immediately through 
                our integrated freelance marketplace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-red-800 to-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">{member.initials}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-red-800 to-red-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl text-red-100 mb-8">
            Whether you&apos;re looking to learn new skills, teach others, or find talented professionals, 
            Skill Connect Pro is the platform for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-red-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Today
            </Link>
            <Link
              to="/courses"
              className="bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-600 transition-colors"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

