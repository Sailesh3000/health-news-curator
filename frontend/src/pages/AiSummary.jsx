import React, { useEffect, useState } from "react";
import { llamaSummarize } from "../services/aiService";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { Loader2, Sparkles } from "lucide-react"; // adjust if you use different icons
import { useNews } from "../context/NewsContext";

function splitSummary(summary) {
  const sentences = summary.split(/(?<=[.?!])\s+/);
  return {
    tldr: sentences.slice(0, 2).join(" "),
    takeaways: sentences.slice(2, 5),
  };
}

function AiSummary() {
  const { articles } = useNews();
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
        clearInterval(processTimer);
      }
    }, 1500);

    return () => clearInterval(processTimer);
  }, [articles]);

  useEffect(() => {
    async function processAll() {
      const results = {};
      for (const article of articles) {
        const summary = await llamaSummarize(
          article.description || article.content || article.title
        );
        results[article.id] = splitSummary(summary);
      }
      setSummaries(results);
    }
    processAll();
  }, [articles]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Processing
          </h1>
          <p className="text-gray-600">Generating summaries and takeaways...</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="animate-spin h-8 w-8 text-purple-600 mr-3" />
            <span className="text-lg font-medium">
              Processing {processedCount} of {articles.length} articles
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${(processedCount / articles.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {currentArticle && (
          <Card className="p-6 mb-6 border-2 border-purple-200 bg-purple-50">
            <div className="text-center">
              <Badge variant="info" className="mb-4">
                Currently Processing
              </Badge>
              <h3 className="font-semibold text-gray-900 mb-2">
                {currentArticle.title}
              </h3>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <span>✓ Extracting key information</span>
                <span>✓ Generating TL;DR</span>
                <span>✓ Creating takeaways</span>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.slice(0, processedCount).map((article) => {
            const processed = summaries[article.id];
            return (
              <Card key={article.id} className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-800">
                    Processed
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">
                  {article.title}
                </h4>
                {processed && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-purple-700">TL;DR:</span>
                      <p className="text-gray-700">{processed.tldr}</p>
                    </div>
                    <div>
                      <span className="font-medium text-purple-700">
                        Takeaways:
                      </span>
                      <ul className="text-gray-600 text-xs list-disc ml-4">
                        {processed.takeaways.map((takeaway, idx) => (
                          <li key={idx}>{takeaway}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {!processing && (
          <div className="text-center mt-8">
            <Badge variant="success" className="mb-4">
              ✓ All articles processed!
            </Badge>
            <br />
            <Button onClick={onNext} size="lg">
              <BookOpen className="mr-2 h-4 w-4" />
              View News Feed
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AiSummary;