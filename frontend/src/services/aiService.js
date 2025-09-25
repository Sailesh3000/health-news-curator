import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(import.meta.env.VITE_HF_TOKEN);

// Enhanced text preprocessing
function preprocessText(text) {
  if (!text) return "No content available";
  
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, ' ')
    // Remove extra whitespace and normalize
    .replace(/\s+/g, ' ')
    // Remove special characters that might confuse the model
    .replace(/[^\w\s.,!?;:()\-'"]/g, ' ')
    // Remove markdown formatting
    .replace(/[*#_`]/g, ' ')
    // Clean up multiple spaces again
    .replace(/\s+/g, ' ')
    // Trim and limit length
    .trim()
    .substring(0, 2000);
}

// IMPROVED: Much better response parsing that handles malformed responses
function parseAIResponse(response, fallbackText = null) {
  try {
    // Clean the response more aggressively
    let cleanResponse = response.trim()
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove ALL markdown formatting
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/`{1,3}/g, '') // Remove code blocks
      .replace(/_{1,2}/g, '') // Remove underscores
      // Remove bullet symbols
      .replace(/[▸•◦▪▫]/g, '')
      // Clean up JSON artifacts that might be mixed in
      .replace(/\{[^}]*\}/g, '')
      .replace(/\[[^\]]*\]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log('Cleaned response:', cleanResponse.substring(0, 100) + '...'); // Debug log
    
    let tldr = '';
    let takeaways = [];
    
    // More robust TL;DR extraction
    const tldrPatterns = [
      /(?:TL;DR:?\s*)(.*?)(?=Key\s*(?:Takeaways?|Insights?)|$)/is,
      /(?:Summary:?\s*)(.*?)(?=Key\s*(?:Takeaways?|Insights?)|$)/is,
      /(?:Brief:?\s*)(.*?)(?=Key\s*(?:Takeaways?|Insights?)|$)/is,
      // Handle cases where there's no "Key" section after
      /(?:TL;DR:?\s*)(.*?)(?=\n|$)/is,
    ];
    
    for (const pattern of tldrPatterns) {
      const match = cleanResponse.match(pattern);
      if (match && match[1] && match[1].trim().length > 10) {
        tldr = match[1].trim();
        // Clean up any remaining artifacts
        tldr = tldr
          .replace(/^["']|["']$/g, '') // Remove quotes
          .replace(/\s+/g, ' ')
          .trim();
        break;
      }
    }
    
    // Enhanced takeaways extraction
    const takeawaysPatterns = [
      /(?:Key\s*(?:Takeaways?|Insights?):?\s*)(.*?)$/is,
      /(?:Main\s*Points?:?\s*)(.*?)$/is,
      /(?:Important\s*Points?:?\s*)(.*?)$/is,
    ];
    
    let takeawaysText = '';
    for (const pattern of takeawaysPatterns) {
      const match = cleanResponse.match(pattern);
      if (match && match[1] && match[1].trim()) {
        takeawaysText = match[1].trim();
        break;
      }
    }
    
    if (takeawaysText) {
      // Split by common separators and clean each item
      const items = takeawaysText
        .split(/(?:\n|\d+\.|\*|\-|▸|•)/)
        .map(item => item.trim())
        .filter(item => item && item.length > 5)
        // Remove items that look like artifacts
        .filter(item => !item.match(/^(Key|Important|Contains|Worth|Article)/i))
        .filter(item => !item.includes('{') && !item.includes('}'))
        .slice(0, 3);
      
      // Clean each takeaway
      takeaways = items.map(item => {
        return item
          .replace(/^["']|["']$/g, '') // Remove quotes
          .replace(/^\W+/, '') // Remove leading non-word chars
          .replace(/\s+/g, ' ')
          .trim();
      }).filter(item => item.length > 10);
    }
    
    // If we still don't have good content, try alternative parsing
    if (!tldr || takeaways.length === 0) {
      const lines = cleanResponse
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 15 && !line.match(/^(TL;DR|Key|Summary)/i));
      
      if (!tldr && lines.length > 0) {
        tldr = lines[0];
      }
      
      if (takeaways.length === 0 && lines.length > 1) {
        takeaways = lines.slice(1, 4);
      }
    }
    
    // Final validation and cleanup
    if (!tldr || tldr.length < 15) {
      // Try to extract from the beginning of the response or use fallback
      if (fallbackText) {
        const sentences = fallbackText.split(/[.!?]+/).filter(s => s.trim().length > 15);
        if (sentences.length > 0) {
          tldr = sentences[0].trim() + '.';
        }
      }
      
      if (!tldr || tldr.length < 15) {
        tldr = "Article contains important information worth reading.";
      }
    }
    
    // Ensure tldr doesn't contain artifacts
    tldr = tldr.replace(/^(More than|\d+|Here's)/i, match => {
      if (match.toLowerCase() === 'more than') return match;
      return 'This article discusses ';
    });
    
    // Filter and improve takeaways
    if (takeaways.length === 0) {
      takeaways = [
        "Article provides relevant information and context",
        "Contains important details worth reviewing", 
        "Offers valuable insights on the topic"
      ];
    } else {
      // Clean up existing takeaways
      takeaways = takeaways.map(takeaway => {
        let clean = takeaway.trim();
        
        // Fix common issues
        if (clean.match(/^(Important|Contains|Worth|Article)/i)) {
          return "Provides valuable context and background information";
        }
        
        // Ensure proper sentence structure
        if (!clean.match(/[.!?]$/)) {
          clean += '.';
        }
        
        return clean;
      });
    }
    
    // Ensure we have exactly 3 takeaways
    while (takeaways.length < 3) {
      if (takeaways.length === 1) {
        takeaways.push("Offers detailed analysis and background context.");
      } else {
        takeaways.push("Contains additional relevant information and insights.");
      }
    }
    
    return {
      tldr: tldr,
      takeaways: takeaways.slice(0, 3)
    };
    
  } catch (error) {
    console.error('Response parsing error:', error);
    return createFallbackSummary(fallbackText);
  }
}

// Improved Summarization Service with stricter formatting and better isolation
export async function llamaSummarize(text, url, articleTitle = '') {
  const cleanText = preprocessText(text);
  
  // Add a unique identifier to make each request distinct
  const requestId = Date.now() + Math.random();

  // Include article title for better context
  const contextualPrompt = articleTitle 
    ? `Analyze this article titled "${articleTitle}":\n\n"${cleanText}"`
    : `Analyze this article:\n\n"${cleanText}"`;

  const prompt = `${contextualPrompt}

Respond ONLY with this exact structure (no extra text, no markdown, no asterisks):

TL;DR: [One clear sentence summary specific to THIS article]

Key Takeaways:
1. [First important point from THIS article]
2. [Second important point from THIS article]  
3. [Third important point from THIS article]

Do not add any other text, formatting, or commentary. Focus only on the content provided above.`;

  try {
    // Add timestamp to ensure unique requests
    console.log(`Summarizing article (${requestId}):`, articleTitle || url || 'Unknown');
    
    const chatCompletion = await client.chatCompletion({
      provider: "together",
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: [
        {
          role: "system",
          content: `You are a precise summarizer. You must follow the exact format requested without any additional formatting, markdown, or commentary. No asterisks, no bold text, no extra words. Current request ID: ${requestId}`
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 250,
      temperature: 0.3, // Slightly higher for variety but still consistent
      // Add cache-busting parameters if supported
      seed: Math.floor(Math.random() * 1000000),
    });
    
    const response = chatCompletion.choices[0].message.content;
    console.log(`Raw AI response for ${requestId}:`, response.substring(0, 100) + '...'); // Debug log
    
    // Parse and clean the response
    const parsedResponse = parseAIResponse(response, cleanText);
    
    // Validation - check if response is actually about the article
    const responseWords = parsedResponse.tldr.toLowerCase().split(' ');
    const articleWords = cleanText.toLowerCase().split(' ').slice(0, 50);
    const hasRelevance = responseWords.some(word => 
      word.length > 4 && articleWords.includes(word)
    );
    
    // If response seems generic or unrelated, use fallback
    if (!hasRelevance || 
        parsedResponse.tldr.toLowerCase().includes("can't provide") || 
        parsedResponse.tldr.toLowerCase().includes("unable to") ||
        parsedResponse.tldr.length < 10) {
      console.log(`Using fallback for ${requestId}`);
      return createFallbackSummary(cleanText, articleTitle);
    }
    
    return parsedResponse;
    
  } catch (error) {
    console.error(`Summarization error for ${requestId}:`, error);
    return createFallbackSummary(cleanText, articleTitle);
  }
}

// Enhanced fallback summary creator
function createFallbackSummary(text, articleTitle = '') {
  const cleanText = text ? preprocessText(text) : "No content available";
  
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  let tldr;
  if (articleTitle && articleTitle.length > 10) {
    // Use the article title as a base for the summary
    tldr = `This article discusses ${articleTitle.toLowerCase()}.`;
  } else if (sentences.length > 0) {
    tldr = sentences[0].trim() + (sentences[0].trim().endsWith('.') ? '' : '.');
  } else {
    tldr = "This article contains important news information.";
  }
  
  const takeaways = [
    "Article provides relevant news content and information.",
    "Full details and context available in the complete article.",
    "Source contains additional background and related information."
  ];
  
  return {
    tldr: tldr,
    takeaways: takeaways
  };
}

// Main function with better isolation
export async function getSummary(article) {
  // Create a new context for each article
  const articleData = {
    text: article.description || article.content || article.title || "No content available",
    url: article.url || 'source',
    title: article.title || ''
  };
  
  // Add delay between requests to prevent overlap
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const summary = await llamaSummarize(
    articleData.text, 
    articleData.url,
    articleData.title
  );
  
  return summary;
}

// Enhanced Friendly Rewrite Service
export async function rewriteArticleFriendly(text, articleTitle = '') {
  const cleanText = preprocessText(text).substring(0, 3000);
  
  // Add unique identifier
  const requestId = Date.now() + Math.random();
  
  const contextualIntro = articleTitle 
    ? `Rewrite this news content about "${articleTitle}" in a friendly, conversational tone:`
    : `Rewrite this news content in a friendly, conversational tone:`;
  
  const prompt = `${contextualIntro}

"${cleanText}"

Requirements:
- Simple and clear language
- Conversational but informative  
- 2-3 paragraphs maximum
- No formatting or special characters
- Just the rewritten content, nothing else
- Focus specifically on the content provided above

Content:`;

  try {
    console.log(`Rewriting article (${requestId}):`, articleTitle || 'Unknown');
    
    const response = await client.chatCompletion({
      provider: "auto", 
      model: "meta-llama/Llama-3.2-1B-Instruct",
      messages: [
        {
          role: "system",
          content: `You are a friendly journalist. Rewrite news content in simple terms. Provide ONLY the rewritten content with no meta-commentary, introductions, or special formatting. Request ID: ${requestId}`
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 600,
      temperature: 0.4,
      seed: Math.floor(Math.random() * 1000000),
    });

    let rewritten = response.choices?.[0]?.message?.content;
    
    if (rewritten) {
      rewritten = rewritten
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/^(Here's a friendly rewrite:?|Here's the rewrite:?|Rewritten version:?|Content:)\s*/i, '')
        .replace(/^(In simple terms:?|In a friendly tone:?)\s*/i, '')
        .replace(/^(Here's what's happening:?)\s*/i, '')
        .trim();
    }
    
    if (!rewritten || rewritten.toLowerCase().includes("can't provide") || rewritten.length < 50) {
      const sentences = cleanText.split(/[.!?]+/).slice(0, 2);
      rewritten = `Here's what's happening: ${sentences[0]}${sentences[0]?.endsWith('.') ? '' : '.'} ${sentences[1] || ''} This story is definitely worth following.`;
    }
    
    return {
      content: rewritten
    };
    
  } catch (error) {
    console.error(`Rewrite error for ${requestId}:`, error);
    return {
      content: `Here's the scoop: ${cleanText.substring(0, 200)}... There's more to this story that's worth checking out!`
    };
  }
}

// Batch processing with proper isolation
export async function processBatchSummaries(articles, batchSize = 3) {
  const results = [];
  
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    
    // Process each batch with delays to prevent overlap
    const batchResults = await Promise.all(
      batch.map(async (article, index) => {
        // Add staggered delay for each item in batch
        await new Promise(resolve => setTimeout(resolve, index * 200));
        return getSummary(article);
      })
    );
    
    results.push(...batchResults);
    
    // Delay between batches
    if (i + batchSize < articles.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}