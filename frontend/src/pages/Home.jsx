import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNews } from "../context/NewsContext";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { Loader2, Sparkles } from "lucide-react";

function Home({ onNext }) {
  const { articles, setArticles } = useNews();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const options = {
          method: "GET",
          url: "https://live-fitness-and-health-news.p.rapidapi.com/news",
          headers: {
            "x-rapidapi-key": "dcad24b8b4mshbac2355e1f3d275p1b457ajsn61428f99ae73",
            "x-rapidapi-host": "live-fitness-and-health-news.p.rapidapi.com",
          },
        };
        const response = await axios.request(options);
        setArticles(response.data || []);
      } catch (error) {
        setArticles([]);
        // Optionally show error to user
      }
      setLoading(false);
    };
    fetchArticles();
  }, [setArticles]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">News Curator</h1>
          <p className="text-gray-600">Loading latest news articles...</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
              <p className="text-sm text-gray-500">Fetching articles from RSS feeds...</p>
            </div>
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-24 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Badge variant="success">✓ {articles.length} articles loaded</Badge>
            </div>
            {articles.map(article => (
              <Card key={article.title} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={article.media || "https://via.placeholder.com/96x96"}
                      alt={article.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800">{article.title}</h2>
                    <p className="text-gray-600 text-sm mt-1">{article.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        {article.source}
                      </Badge>
                      <Badge variant="outline" className="text-gray-600 border-gray-600">
                        {new Date(article.published_date).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <div className="text-center mt-8">
              <Button
                onClick={onNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300"
              >
                <Sparkles className="w-5 h-5 inline-block mr-2" />
                Show More Articles
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;