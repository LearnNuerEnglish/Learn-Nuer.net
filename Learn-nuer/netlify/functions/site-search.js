import fs from 'fs';
import path from 'path';
import striptags from 'striptags';

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { userQuery } = JSON.parse(event.body);
    if (!userQuery) {
      return { statusCode: 400, body: JSON.stringify({ error: "Query is required" }) };
    }

    // List of HTML files inside your repository
    const htmlFiles = [
      'index.html',
      'conversations.html',
      'dictionary.html',
      'grammar.html',
      'lessons.html',
      'numbers.html',
      'time.html',
      'keyboard.html',
      'about.html'
    ];

    let combinedWebsiteText = "";

    // Read and clean HTML text from files
    for (const fileName of htmlFiles) {
      // Adjust path if your HTML files are located inside a subfolder like 'Learn-nuer'
      const filePath = path.resolve('./', fileName);
      
      if (fs.existsSync(filePath)) {
        const rawHtml = fs.readFileSync(filePath, 'utf8');
        
        // Remove scripts and styles before stripping tags
        const cleanContent = rawHtml
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

        const textOnly = striptags(cleanContent).replace(/\s+/g, ' ').trim();
        combinedWebsiteText += `\n--- PAGE: ${fileName} ---\n${textOnly}\n`;
      }
    }

    // Call Groq AI API (Free Llama 3)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for the Learn Nuer website.
STRICT RULE: Answer the user's question using ONLY the provided HTML page text from the website. If you cannot find the answer in the text, respond: "I couldn't find that on the website."

--- WEBSITE DATA START ---
${combinedWebsiteText}
--- WEBSITE DATA END ---`
          },
          {
            role: "user",
            content: userQuery
          }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "No response received.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error("Error searching site:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to search site code." })
    };
  }
}
