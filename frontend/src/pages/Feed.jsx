import React, { useState } from "react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { Loader2, Sparkles, RefreshCw, Clock } from "lucide-react";

function Feed({ articles, processedSummaries, onArticleClick }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const articlesPerPage = 2;
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  const currentArticles = articles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setCurrentPage(1);
    }, 1500);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">News Feed</h1>
            <Button 
              variant="ghost" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {refreshing && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 text-blue-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Pulling latest updates...</span>
            </div>
          </div>
        )}

        {/* Articles */}
        <div className="space-y-6">
          {currentArticles.map(article => {
            const processed = processedSummaries?.[article.id];
            return (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer" 
                    onClick={() => onArticleClick(article)}>
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img 
                      src={article.photo_url} 
                      alt={article.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="info">{article.category}</Badge>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {formatDate(article.published_datetime_utc)}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {article.title}
                    </h2>

                    {processed && (
                      <div className="space-y-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 font-medium">
                            📝 TL;DR: {processed.tldr}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 text-sm">Key Takeaways:</h4>
                          <ul className="space-y-1">
                            {processed.takeaways.map((takeaway, idx) => (
                              <li key={idx} className="flex items-start text-sm text-gray-600">
                                <span className="text-green-500 mr-2 mt-0.5">•</span>
                                {takeaway}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{article.source_name}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Read More →
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <Button 
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-2">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  currentPage === idx + 1
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          
          <Button 
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Feed;