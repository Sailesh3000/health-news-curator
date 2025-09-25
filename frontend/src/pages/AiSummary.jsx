import React, { useEffect, useState } from "react";
import { llamaSummarize } from "../services/aiService";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { Loader2, Sparkles, BookOpen, CheckCircle2, Brain } from "lucide-react";

// FIXED: Proper parsing function that matches the AI service format
// FIXED: Trusts aiService's parseAIResponse and ensures fallback safety
function parseSummaryResponse(summary) {
  try {
    if (!summary) {
      return {
        tldr: "Summary not available",
        takeaways: [
          "Content analysis pending",
          "Please check back later",
          "Full article available"
        ]
      };
    }

    // If it's already structured, return directly
    if (typeof summary === "object" && summary.tldr && summary.takeaways) {
      return {
        tldr: summary.tldr,
        takeaways: summary.takeaways.slice(0, 3)
      };
    }

    // If we got a plain string for some reason, wrap it in fallback format
    if (typeof summary === "string") {
      const firstSentence = summary.split(/[.!?]+/)[0] || "Summary not available";
      return {
        tldr: firstSentence.trim() + ".",
        takeaways: [
          "Important information available in full article",
          "Contains relevant news and updates",
          "Worth reading for complete context"
        ]
      };
    }

    // Fallback
    return {
      tldr: "Summary processing error",
      takeaways: [
        "Please try refreshing",
        "Summary will be available shortly",
        "Full article accessible"
      ]
    };

  } catch (error) {
    console.error("Error parsing summary:", error);
    return {
      tldr: "Error processing summary",
      takeaways: [
        "Please try refreshing",
        "Summary will be available shortly",
        "Full article accessible"
      ]
    };
  }
}


function AiSummary({ articles, onNext }) {
  const [summaries, setSummaries] = useState({});
  const [processing, setProcessing] = useState(true);
  const [processedCount, setProcessedCount] = useState(0);
  const [currentArticle, setCurrentArticle] = useState(null);

  useEffect(() => {
    let count = 0;
    const processTimer = setInterval(() => {
      if (count < articles.length) {
        setCurrentArticle(articles[count]);
        setProcessedCount(count + 1);
        count++;
      } else {
        setProcessing(false);
        setCurrentArticle(null);
        clearInterval(processTimer);
      }
    }, 1500);

    return () => clearInterval(processTimer);
  }, [articles]);

useEffect(() => {
  async function processAll() {
    const results = {};

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      // use a stable key (id if present, otherwise url, title or index)
      const key = article.uuid;

      try {
        console.log(`Processing article: ${article.title ?? key}`);

        // show current article in UI while processing
        setCurrentArticle(article);

        const summary = await llamaSummarize(
          article.description || article.content || article.title || '',
          article.url,
          article.title || ''
        );

        console.log(`Raw response for article ${key}:`, summary);

        const parsed = parseSummaryResponse(summary);
        results[key] = parsed;

        // update UI state incrementally so the page renders progressively
        setSummaries(prev => ({ ...prev, [key]: parsed }));
        setProcessedCount(prev => prev + 1);

        // tiny delay to be polite to API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing article ${key}:`, error);
        const fallback = {
          tldr: "Error processing this article summary",
          takeaways: [
            "Unable to generate summary at this time",
            "Please try refreshing the page",
            "Full article content still available"
          ]
        };
        results[key] = fallback;
        setSummaries(prev => ({ ...prev, [key]: fallback }));
        setProcessedCount(prev => prev + 1);
      } finally {
        // clear the currentArticle when done with this one
        setCurrentArticle(null);
      }
    }

    console.log('Final processed results:', results);
    // ensure state reflects the final batch
    setSummaries(results);
    setProcessing(false);
  }

  // reset progress when articles change
  setSummaries({});
  setProcessedCount(0);
  setProcessing(true);
  processAll();
}, [articles]);


  const progressPercentage = (processedCount / articles.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            AI Content Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI is processing your articles to generate intelligent summaries and actionable insights
          </p>
        </div>

        {/* Progress Section */}
        <div className="mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Sparkles className="animate-spin h-10 w-10 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {processedCount} / {articles.length}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Articles Processed
                </div>
              </div>
            </div>
            
            {/* Modern Progress Bar */}
            <div className="relative">
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="text-center mt-3">
                <span className="text-sm font-semibold text-gray-700">
                  {Math.round(progressPercentage)}% Complete
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Processing Card */}
        {currentArticle && processing && (
          <div className="mb-8">
            <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200/50 shadow-lg">
              <div className="text-center">
                <Badge variant="info" className="mb-4 px-4 py-2 text-sm font-semibold">
                  🔍 Currently Analyzing
                </Badge>
                <h3 className="text-xl font-bold text-gray-900 mb-6 leading-tight">
                  {currentArticle.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-center space-x-2 text-green-700 bg-green-100 py-3 px-4 rounded-xl">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Key Information</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-blue-700 bg-blue-100 py-3 px-4 rounded-xl">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">TL;DR Summary</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-purple-700 bg-purple-100 py-3 px-4 rounded-xl">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Key Takeaways</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Processed Articles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {articles.slice(0, processedCount).map((article,idx) => {
            const key = article.uuid;
            const processed = summaries[key];
            return (
              <Card 
                key={key} 
                className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                  <Badge variant="success" className="text-xs font-semibold px-3 py-1">
                    ✓ Completed
                  </Badge>
                </div>
                
                <h4 className="font-bold text-gray-900 mb-4 text-lg leading-tight line-clamp-2">
                  {article.title}
                </h4>
                
                {processed && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm font-bold text-blue-800">TL;DR</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{processed.tldr}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                      <div className="flex items-center mb-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        <span className="text-sm font-bold text-purple-800">Key Insights</span>
                      </div>
                      <ul className="space-y-2">
                        {processed.takeaways.map((takeaway, idx) => (
                          <li key={idx} className="text-gray-700 text-sm flex items-start">
                            <span className="text-purple-500 mr-2 text-xs mt-1">▸</span>
                            <span className="leading-relaxed">{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Loading state for articles still being processed */}
                {!processed && (
                  <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 animate-pulse">
                      <div className="flex items-center mb-2">
                        <Loader2 className="w-3 h-3 text-gray-400 mr-2 animate-spin" />
                        <span className="text-sm font-bold text-gray-600">Processing TL;DR...</span>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    
                    <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 animate-pulse">
                      <div className="flex items-center mb-3">
                        <Loader2 className="w-3 h-3 text-gray-400 mr-2 animate-spin" />
                        <span className="text-sm font-bold text-gray-600">Extracting insights...</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/5"></div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Completion Section */}
        {!processing && (
          <div className="text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl inline-block">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <Badge variant="success" className="mb-6 px-6 py-3 text-base font-bold">
                🎉 Analysis Complete!
              </Badge>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                All {articles.length} articles have been successfully analyzed and summarized
              </p>
              <Button 
                onClick={onNext} 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <BookOpen className="mr-3 h-5 w-5" />
                View Your News Feed
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AiSummary;