import { Link } from 'react-router-dom';
import { PlayCircle, BookOpen } from 'lucide-react';

const EducationPage = () => {
  // Sample video data - replace with your actual content
  const farmerVideos = [
    {
      id: 1,
      title: 'Organic Farming Techniques',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual YouTube ID
      description: 'Learn modern organic farming methods to increase yield',
      duration: '12:34'
    },
    {
      id: 2,
      title: 'Sustainable Agriculture',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual YouTube ID
      description: 'Best practices for sustainable farming',
      duration: '15:20'
    },
    {
      id: 3,
      title: 'Crop Rotation Guide',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual YouTube ID
      description: 'How to implement effective crop rotation',
      duration: '08:45'
    },
    {
      id: 4,
      title: 'Soil Health Management',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual YouTube ID
      description: 'Improving and maintaining healthy soil',
      duration: '18:12'
    }
  ];

  // Sample courses data
  const courses = [
    {
      id: 1,
      title: 'Affiliate Marketing Basics',
      provider: 'Farm Marketing Institute',
      duration: '4 weeks',
      level: 'Beginner'
    },
    {
      id: 2,
      title: 'Digital Marketing for Farmers',
      provider: 'Agri Business Academy',
      duration: '6 weeks',
      level: 'Intermediate'
    },
    {
      id: 3,
      title: 'Selling Farm Products Online',
      provider: 'E-Commerce for Agriculture',
      duration: '8 weeks',
      level: 'Advanced'
    }
  ];

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Farmer Education Hub</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Learn modern farming techniques, marketing strategies, and business skills to grow your agricultural business.
        </p>
      </div>

      {/* Videos Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <PlayCircle className="mr-2 text-green-600" size={24} />
            Educational Videos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {farmerVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                <span className="text-xs text-gray-500">{video.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <BookOpen className="mr-2 text-green-600" size={24} />
            Marketing Courses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                  {course.level}
                </span>
              </div>
              <h3 className="font-semibold text-xl mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">By {course.provider}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{course.duration}</span>
                <Link 
                  to="#" // Replace with actual course link
                  className="text-green-600 hover:text-green-800 font-medium text-sm"
                >
                  Enroll Now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Resources Section */}
      <section className="mt-16 bg-green-50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Additional Resources</h2>
        <p className="text-gray-600 mb-6">
          Explore our collection of articles, guides, and tools to help you succeed in modern agriculture.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="#" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-medium text-green-700 mb-2">Farming Best Practices</h3>
            <p className="text-sm text-gray-600">Collection of articles</p>
          </Link>
          <Link to="#" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-medium text-green-700 mb-2">Market Trends</h3>
            <p className="text-sm text-gray-600">Latest agricultural reports</p>
          </Link>
          <Link to="#" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-medium text-green-700 mb-2">Tools & Calculators</h3>
            <p className="text-sm text-gray-600">Helpful farming tools</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default EducationPage;