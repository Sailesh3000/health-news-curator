import React, { useState } from "react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { ArrowLeft, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { rewriteArticleFriendly } from "../services/aiService";

function ArticleDetail({ article, processed, onBack }) {
  const [showRewrite, setShowRewrite] = useState(false);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [friendlyRewrite, setFriendlyRewrite] = useState(null);
  const [error, setError] = useState(null);

  const handleAIRewrite = async () => {
    setRewriteLoading(true);
    setError(null);
    
    try {
      // Get the content to rewrite - prioritize snippet, then content, then title
      const contentToRewrite = article.snippet || article.content || article.description || article.title;
      
      // Call the AI rewrite service
      const rewriteResult = await rewriteArticleFriendly(contentToRewrite);
      
      // Handle different response formats
      let rewriteText = '';
      if (typeof rewriteResult === 'string') {
        rewriteText = rewriteResult;
      } else if (typeof rewriteResult === 'object' && rewriteResult !== null) {
        // Handle object responses - extract text from common properties
        rewriteText = rewriteResult.content || 
                     rewriteResult.text || 
                     rewriteResult.rewrite || 
                     rewriteResult.result || 
                     JSON.stringify(rewriteResult);
      } else {
        rewriteText = 'Unable to process the rewrite response.';
      }
      
      // Store the result in state
      setFriendlyRewrite(rewriteText);
      setShowRewrite(true);
    } catch (err) {
      console.error('Error rewriting article:', err);
      setError('Failed to rewrite article. Please try again.');
    } finally {
      setRewriteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.snippet || article.description || 'Check out this article!',
          url: article.link || article.url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      const linkToShare = article.link || article.url;
      if (linkToShare) {
        navigator.clipboard.writeText(linkToShare);
        alert('Link copied to clipboard!');
      }
    }
  };

  const handleSave = () => {
    try {
      const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');
      const articleId = article.uuid || article.id || article.link || article.url;
      const isAlreadySaved = savedArticles.some(saved => 
        saved.uuid === articleId || saved.id === articleId || saved.link === articleId
      );
      
      if (!isAlreadySaved) {
        savedArticles.push({
          ...article,
          savedAt: new Date().toISOString()
        });
        localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
        alert('Article saved!');
      } else {
        alert('Article already saved!');
      }
    } catch (err) {
      console.error('Error saving article:', err);
      alert('Error saving article. Please try again.');
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No article found</h2>
          <p className="text-gray-600 mb-4">The article you're looking for doesn't exist or couldn't be loaded.</p>
          <Button onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feed
          </Button>
        </Card>
      </div>
    );
  }

  // Get the best available image URL
  const imageUrl = article.photo_url || article.image_url || article.urlToImage;
  
  // Get the best available content
  const articleContent = article.snippet || article.content || article.description || 'No content available for this article.';
  
  // Get the best available source name
  const sourceName = article.source_name || article.source?.name || article.source;
  
  // Get the best available published date
  const publishedDate = article.published_datetime_utc || article.published_at || article.publishedAt;
  
  // Get the best available URL
  const originalUrl = article.link || article.url;

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
              {article.category && (
                <Badge variant="info">{article.category}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Article Image */}
        {imageUrl && (
          <div className="mb-8">
            <img 
              src={imageUrl} 
              alt={article.title}
              className="w-full aspect-video object-cover rounded-xl"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-6 flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              {sourceName && (
                <>
                  <span className="font-medium">{sourceName}</span>
                  <span>•</span>
                </>
              )}
              {publishedDate && (
                <span>{formatDate(publishedDate)}</span>
              )}
            </div>
            {originalUrl && (
              <a 
                href={originalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
              >
                <span>View Original</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          {processed && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
                AI Summary
              </h3>
              {processed.tldr && (
                <p className="text-gray-700 mb-4 font-medium">{processed.tldr}</p>
              )}
              {processed.takeaways && processed.takeaways.length > 0 && (
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
              )}
            </div>
          )}
        </div>

        {/* Original Content */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Original Article</h3>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p>{articleContent}</p>
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

          {error && (
            <Card className="p-6 bg-red-50 border-red-200 mb-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-red-800 font-medium">Error: {error}</span>
              </div>
              <Button 
                onClick={handleAIRewrite}
                variant="outline"
                size="sm"
                className="mt-4 border-red-300 text-red-700 hover:bg-red-50"
              >
                Try Again
              </Button>
            </Card>
          )}

          {rewriteLoading && (
            <Card className="p-6 bg-purple-50 border-purple-200">
              <div className="text-center">
                <Loader2 className="animate-spin h-8 w-8 text-purple-600 mx-auto mb-4" />
                <p className="text-purple-800 font-medium">AI is rewriting this article in a friendly, easy-to-understand tone...</p>
                <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-purple-600 flex-wrap">
                  <span>✓ Simplifying complex terms</span>
                  <span>✓ Adding friendly explanations</span>
                  <span>✓ Making it conversational</span>
                </div>
              </div>
            </Card>
          )}

          {showRewrite && friendlyRewrite && (
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <Badge variant="success">Friendly Version Complete!</Badge>
              </div>
              <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                <p>{friendlyRewrite}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-green-200">
                <p className="text-sm text-green-700 italic">
                  ✨ This version uses simple language, relatable analogies, and a conversational tone to make complex news more accessible to everyone!
                </p>
              </div>
            </Card>
          )}

          {!showRewrite && !rewriteLoading && !error && (
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
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 flex-wrap gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feed
          </Button>
          
          <div className="flex items-center space-x-3 flex-wrap">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              Share Article
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSave}>
              Save for Later
            </Button>
            {originalUrl && (
              <a 
                href={originalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="default" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Read Full Article
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleDetail;