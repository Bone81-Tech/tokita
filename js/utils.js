// js/utils.js - Utility functions for Tokita

// Helper function to sanitize output for display
function sanitizeOutput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Helper function to validate and sanitize URL
function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  
  try {
    const urlObj = new URL(url);
    // Only allow http/https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return '';
    }
    return urlObj.href;
  } catch (e) {
    // Not a valid URL, return empty string
    return '';
  }
}

// Helper function with error handling wrapper
function withErrorHandler(fn, errorMsg = 'Error occurred') {
  return function(...args) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      console.error(errorMsg, error);
      // Return a safe fallback value
      return null;
    }
  };
}

// API utility functions
const ApiUtils = {
  // Handle API responses
  handleApiResponse: function(response) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Handle fetch errors
  handleFetchError: function(error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// DOM utility functions
const DomUtils = {
  // Safely get element by ID
  getElementById: function(id) {
    try {
      return document.getElementById(id);
    } catch (error) {
      console.error(`Error getting element with ID: ${id}`, error);
      return null;
    }
  },

  // Safely query elements
  querySelector: function(selector) {
    try {
      return document.querySelector(selector);
    } catch (error) {
      console.error(`Error querying selector: ${selector}`, error);
      return null;
    }
  },

  // Safely query all elements
  querySelectorAll: function(selector) {
    try {
      return document.querySelectorAll(selector);
    } catch (error) {
      console.error(`Error querying all for selector: ${selector}`, error);
      return [];
    }
  },

  // Create element with error handling
  createElement: function(tagName, options = {}) {
    try {
      const element = document.createElement(tagName);
      
      // Apply attributes if provided
      if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }
      
      // Apply className if provided
      if (options.className) {
        element.className = options.className;
      }
      
      // Apply textContent if provided
      if (options.textContent) {
        element.textContent = sanitizeOutput(options.textContent);
      }
      
      return element;
    } catch (error) {
      console.error(`Error creating element: ${tagName}`, error);
      return document.createElement('div'); // fallback
    }
  }
};

// Export for use in other files if in Node environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sanitizeOutput, sanitizeUrl, withErrorHandler, ApiUtils, DomUtils };
} else {
  // For browser environment
  window.TokitaUtils = { sanitizeOutput, sanitizeUrl, withErrorHandler, ApiUtils, DomUtils };
}