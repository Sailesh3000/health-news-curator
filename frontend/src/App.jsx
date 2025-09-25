import { useState, useContext } from 'react'
import './App.css'
import AiSummary from './pages/AiSummary';
import Feed from './pages/Feed';
import ArticleDetail from './pages/ArticleDetail';
import Home from './pages/Home';
import { NewsContext } from './context/NewsContext'; // Import your context
import Card from './components/Card'; // Add this import at the top

function App() {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { articles, setArticles } = useContext(NewsContext); // Get articles from context

  const handleNextScreen = () => {
    setCurrentScreen(prev => prev + 1);
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setCurrentScreen(4);
  };

  const handleBackToFeed = () => {
    setSelectedArticle(null);
    setCurrentScreen(3);
  };

  const handleBackToScreen = (screenNumber) => {
    setCurrentScreen(screenNumber);
  };

  // Screen Navigation Component
  const ScreenIndicator = () => (
    <div className="fixed top-4 right-4 z-50">
      <Card className="p-3 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => handleBackToScreen(num)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                currentScreen === num
                  ? 'bg-blue-600 text-white'
                  : currentScreen > num
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {currentScreen > num ? '✓' : num}
            </button>
          ))}
        </div>
        <div className="text-xs text-center mt-2 text-gray-600">
          Step {currentScreen} of 4
        </div>
      </Card>
    </div>
  );

  return (
    <div className="relative">
      <ScreenIndicator />
      
      {currentScreen === 1 && (
        <Home 
          onNext={handleNextScreen}
          articles={articles}
          setArticles={setArticles}
        />
      )}
      
      {currentScreen === 2 && (
        <AiSummary
          articles={articles}
          onNext={handleNextScreen}
        />
      )}
      
      {currentScreen === 3 && (
        <Feed
          articles={articles}
          onArticleClick={handleArticleClick}
        />
      )}
      
      {currentScreen === 4 && selectedArticle && (
        <ArticleDetail
          article={selectedArticle}
          onBack={handleBackToFeed}
        />
      )}
    </div>
  );
}

export default App;
