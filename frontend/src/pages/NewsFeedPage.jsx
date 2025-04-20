import { useState, useEffect } from 'react';
import { ArrowUpCircle, ExternalLink, Newspaper } from 'lucide-react';
import { format } from 'date-fns';

export default function NewsFeedPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to fetch news from the backend
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/news');

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      setNews(data.articles || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  // Sample fallback data
  const sampleNews = [
    {
      id: 1,
      title: "New agricultural policy aims to boost farmer income in rural India",
      link: "https://example.com/news1",
      published: "2025-04-19T10:30:00Z",
      source: "Agricultural Daily",
    },
    {
      id: 2,
      title: "Climate change affects crop patterns in northern states",
      link: "https://example.com/news2",
      published: "2025-04-18T14:45:00Z",
      source: "Climate Monitor",
    },
    {
      id: 3,
      title: "Government announces subsidies for organic farming equipment",
      link: "https://example.com/news3",
      published: "2025-04-18T09:15:00Z",
      source: "Economy Times",
    },
    {
      id: 4,
      title: "New pest resistant varieties of wheat developed by agricultural scientists",
      link: "https://example.com/news4",
      published: "2025-04-17T16:20:00Z",
      source: "Science Today",
    },
    {
      id: 5,
      title: "Farmers in Maharashtra adopt innovative irrigation techniques",
      link: "https://example.com/news5",
      published: "2025-04-17T08:50:00Z",
      source: "Rural Herald",
    },
  ];

  const displayedNews = news.length > 0 ? news : sampleNews;

  const filteredNews = displayedNews.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">Agriculture News Feed</h1>
          <p className="mt-2 text-gray-600">
            Stay updated with the latest agricultural news and developments
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button className="bg-green-600 text-white px-4 py-1 rounded-full text-sm hover:bg-green-700">
            All News
          </button>
          <button className="bg-white text-green-600 border border-green-600 px-4 py-1 rounded-full text-sm hover:bg-green-50">
            Crop Prices
          </button>
          <button className="bg-white text-green-600 border border-green-600 px-4 py-1 rounded-full text-sm hover:bg-green-50">
            Government Policies
          </button>
          <button className="bg-white text-green-600 border border-green-600 px-4 py-1 rounded-full text-sm hover:bg-green-50">
            Weather
          </button>
          <button className="bg-white text-green-600 border border-green-600 px-4 py-1 rounded-full text-sm hover:bg-green-50">
            Technology
          </button>
        </div>

        {/* News Feed */}
        <div className="space-y-6">
          {filteredNews.map((item, index) => (
            <article
              key={item.id || index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h2>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <Newspaper size={14} className="mr-1" /> {item.source || 'Google News'}
                </span>
                <span>{formatDate(item.published)}</span>
              </div>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-green-600 hover:text-green-800 font-medium"
              >
                Read more <ExternalLink size={16} className="ml-1" />
              </a>
            </article>
          ))}

          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-center py-4 text-red-500">
              Error: {error}. Showing sample news instead.
            </div>
          )}

          {/* Footer Info */}
          <div className="text-center py-4 text-gray-500 text-sm">
            News data sourced from Google News via RSS feed
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUpCircle size={24} />
        </button>
      )}
    </div>
  );
}
