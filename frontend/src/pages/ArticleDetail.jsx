import React, { useState } from "react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { ArrowLeft, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { rewriteArticleFriendly } from "../services/aiService";

function ArticleDetail({ article, processed, onBack }) {
  const [showRewrite, setShowRewrite] = useState(false);
  const [rewriteLoading, setRewriteLoading] = useState(false);

  const handleAIRewrite = async () => {
    setRewriteLoading(true);
    // Call your AI rewrite service here if needed
    setTimeout(() => {
      setRewriteLoading(false);
      setShowRewrite(true);
    }, 2000);

    const friendlyRewrite = await rewriteArticleFriendly(article.snippet || article.content || article.title);
    // Then set this value in your state to display it in the UI.
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (!article) return <div>No article found.</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
              <ArrowLeft size={16} />
              <span>Back to Feed</span>
            </Button>
            <div className="flex-1">
              <Badge variant="info">{article.category}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Article Image */}
        <div className="mb-8">
          <img 
            src={article.photo_url} 
            alt={article.title}
            className="w-full aspect-video object-cover rounded-xl"
          />
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
            <div className="flex items-center space-x-4">
              <span className="font-medium">{article.source_name}</span>
              <span>•</span>
              <span>{formatDate(article.published_datetime_utc)}</span>
            </div>
            <a 
              href={article.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
            >
              <span>View Original</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {processed && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
                AI Summary
              </h3>
              <p className="text-gray-700 mb-4 font-medium">{processed.tldr}</p>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Key Takeaways:</h4>
                <ul className="space-y-2">
                  {processed.takeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-700">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Original Content */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Original Article</h3>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p>{article.snippet}</p>
          </div>
        </div>

        {/* AI Rewrite Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
              AI-Powered Friendly Rewrite
            </h3>
            
            {!showRewrite && (
              <Button 
                onClick={handleAIRewrite}
                disabled={rewriteLoading}
                variant="default"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {rewriteLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Make it Friendly
                  </>
                )}
              </Button>
            )}
          </div>

          {rewriteLoading && (
            <Card className="p-6 bg-purple-50 border-purple-200">
              <div className="text-center">
                <Loader2 className="animate-spin h-8 w-8 text-purple-600 mx-auto mb-4" />
                <p className="text-purple-800 font-medium">AI is rewriting this article in a friendly, easy-to-understand tone...</p>
                <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-purple-600">
                  <span>✓ Simplifying complex terms</span>
                  <span>✓ Adding friendly explanations</span>
                  <span>✓ Making it conversational</span>
                </div>
              </div>
            </Card>
          )}

          {showRewrite && processed && (
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <Badge variant="success">Friendly Version Complete!</Badge>
              </div>
              <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                <p>{processed.friendlyRewrite}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-green-200">
                <p className="text-sm text-green-700 italic">
                  ✨ This version uses simple language, relatable analogies, and a conversational tone to make complex news more accessible to everyone!
                </p>
              </div>
            </Card>
          )}

          {!showRewrite && !rewriteLoading && (
            <Card className="p-6 border-2 border-dashed border-gray-300 bg-gray-50">
              <div className="text-center text-gray-500">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-2">Want this article explained in a friendly, easy-to-understand way?</p>
                <p className="text-sm">Our AI can rewrite complex news in simple, conversational language.</p>
              </div>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feed
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              Share Article
            </Button>
            <Button variant="ghost" size="sm">
              Save for Later
            </Button>
            <a 
              href={article.link} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="default" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Read Full Article
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleDetail;