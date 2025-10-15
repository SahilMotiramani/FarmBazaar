import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import DOMPurify from 'dompurify';

const API_KEY = "AIzaSyBXZjss_M1UnGePmnKY3Wjq8fkDzEP8_xU";
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `You are an AI assistant for FarmBazaar, an agricultural marketplace in India. Keep responses concise, practical, and focused on the user's needs.

Formatting guidelines:
- Use simple bullet points (•) for lists
- Use numbered lists only for step-by-step instructions
- Keep paragraphs short (2-3 sentences max)
- Bold only the most critical information
- Avoid unnecessary introductions or conclusions

User types:
- Farmers: Need farming advice, pest control, pricing help
- Buyers: Need crop info, quality assessment, market trends

Always consider the user's region and respond in their preferred language.`;

const useAIChat = ({ userType = 'guest', language = 'English', region = '' }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getContextualPrompt = () => {
    let contextualPrompt = SYSTEM_PROMPT;
    
    if (userType === 'farmer') {
      contextualPrompt += "\n\nCurrent user is a farmer. Focus on practical farming advice, crop management, and marketplace selling tips.";
    } else if (userType === 'buyer') {
      contextualPrompt += "\n\nCurrent user is a buyer. Focus on product quality, seasonal availability, and purchasing advice.";
    }
    
    if (region) {
      contextualPrompt += `\n\nUser is from ${region}, India. Provide region-specific advice when possible.`;
    }
    
    contextualPrompt += `\n\nResponse requirements:\n- Maximum 2-3 paragraphs\n- Use simple ${language}\n- Directly answer the question\n- Skip unnecessary details`;
    
    return contextualPrompt;
  };

  const formatResponse = (text) => {
    // Clean up any markdown artifacts first
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\n\s*[-•]\s*/g, '\n• ') // Standardize bullets
      .replace(/\n\s*\d+\.\s*/g, '\n$&') // Preserve numbered lists
      .replace(/\n{3,}/g, '\n\n'); // Remove excessive newlines

    // Convert to HTML paragraphs and lists
    formattedText = formattedText
      .split('\n\n')
      .map(para => {
        if (para.startsWith('•') || para.match(/^\d+\./)) {
          const listType = para.match(/^\d+\./) ? 'ol' : 'ul';
          const items = para.split('\n')
            .filter(item => item.trim())
            .map(item => `<li>${item.replace(/^[•\d+\.]\s*/, '').trim()}</li>`)
            .join('');
          return `<${listType}>${items}</${listType}>`;
        }
        return `<p>${para.trim()}</p>`;
      })
      .join('');

    return DOMPurify.sanitize(formattedText);
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    
    const userMessage = { type: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    setError(null);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const contextualPrompt = getContextualPrompt();
      
      // Keep only last 3 messages for context to avoid long prompts
      const recentMessages = messages.slice(-3);
      const historyText = recentMessages
        .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      
      const finalPrompt = `${contextualPrompt}\n\nCurrent conversation:\n${historyText}\n\nUser: ${messageText}\nAssistant: (respond concisely)`;
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500, // Reduced from 1000 to get shorter responses
          topK: 40,
          topP: 0.95
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      });
      
      const responseText = result.response.text();
      const formattedResponse = formatResponse(responseText);
      
      setMessages(prev => [...prev, { type: 'bot', content: formattedResponse }]);
      
    } catch (err) {
      console.error('AI response error:', err);
      setError('Failed to get response. Please try again.');
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: '<p>Sorry, I encountered an error. Please try again.</p>' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeChat = () => {
    if (messages.length === 0) {
      const welcomeMessage = userType === 'farmer'
        ? '<p>How can I help with your farming needs today?</p><ul><li>Crop advice</li><li>Pest control</li><li>Market prices</li></ul>'
        : '<p>How can I assist with your agricultural purchases?</p><ul><li>Product info</li><li>Quality tips</li><li>Seasonal availability</li></ul>';
      
      setMessages([{ type: 'bot', content: welcomeMessage }]);
    }
  };

  return {
    messages,
    setMessages,
    isLoading,
    error,
    sendMessage,
    initializeChat
  };
};

export default useAIChat;