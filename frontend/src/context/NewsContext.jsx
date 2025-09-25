import React, { createContext, useContext, useState } from "react";

const NewsContext = createContext();

export { NewsContext };

export function NewsProvider({ children }) {
  const [articles, setArticles] = useState([]);
  return (
    <NewsContext.Provider value={{ articles, setArticles }}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  return useContext(NewsContext);
}