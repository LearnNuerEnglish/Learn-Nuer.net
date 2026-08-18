import fs from 'fs';
import path from 'path';
import striptags from 'striptags';

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { userQuery } = JSON.parse(event.body);

    // Explicitly include dictionary.html
    const htmlFiles = [
      'index.html',
      'dictionary.html',
      'conversations.html',
      'grammar.html',
      'lessons.html',
      'numbers.html',
      'time.html',
      'keyboard.html',
      'about.html'
    ];

    let combinedWebsiteText = "";

    for (const fileName of htmlFiles) {
      const filePath = path.resolve('./', fileName);
      if (fs.existsSync(filePath)) {
        const rawHtml = fs.readFileSync(filePath, 'utf8');

        // Remove script and style tags before stripping HTML tags
        const cleanContent = rawHtml
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

        const textOnly = striptags(cleanContent).replace(/\s+/g, ' ').trim();
        combinedWebsiteText += `\n--- PAGE: ${fileName} ---\n${textOnly}\n`;
      }
    }

    // Call Groq Llama 3 API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for Learn Nuer. Strictly answer questions using ONLY the text provided below. Mention which page (e.g. dictionary.html) the answer was found on.\n\n--- WEBSITE CONTENT ---\n${combinedWebsiteText}`
          },
          { role: "user", content: userQuery }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "No result found.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Search failed." })
    };
  }
}
