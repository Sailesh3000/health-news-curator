import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { Loader2, Sparkles } from "lucide-react";

function Home({ onNext, articles, setArticles }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);

      const requestOptions = {
        method: "GET",
      };

      const params = {
        api_token: import.meta.env.VITE_RAPIDAPI_KEY, // store in .env
        categories: "health",
        search1: "health",
        language:"en",
        limit: "150",
      };

      const esc = encodeURIComponent;
      const query = Object.keys(params)
        .map((k) => esc(k) + "=" + esc(params[k]))
        .join("&");

      try {
        const response = await fetch(
          "https://api.thenewsapi.com/v1/news/all?" + query,
          requestOptions
        );
        const result = await response.json();
        console.log(result);

        setArticles(result.data || []);
      } catch (error) {
        console.error("error", error);
        setArticles([]);
      }
      setLoading(false);
    };

    fetchArticles();
  }, []);

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
              <p className="text-sm text-gray-500">
                Fetching articles from TheNewsAPI...
              </p>
            </div>
            {[1, 2, 3, 4].map((i) => (
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
            {articles.map((article) => (
              <Card
                key={article.uuid}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={article.image_url || "https://placehold.co/96x96"}
                      alt={article.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <h2 className="text-lg font-semibold text-blue-800 hover:underline">
                        {article.title}
                      </h2>
                    </a>
                    <p className="text-gray-600 text-sm mt-1">
                      {article.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-600"
                      >
                        {article.source}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-gray-600 border-gray-600"
                      >
                        {new Date(article.published_at).toLocaleDateString()}
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
                Summarize
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
