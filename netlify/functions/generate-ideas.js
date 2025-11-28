// netlify/functions/generate-ideas.js
// This serverless function securely calls the Claude API

const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { profile, photo, isPremium } = JSON.parse(event.body);
    
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Build the prompt
    let prompt = buildPrompt(profile, photo, isPremium);
    
    // Prepare messages
    const messages = [];
    
    if (photo && isPremium) {
      // Include image for premium users
      messages.push({
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: getImageMediaType(photo),
              data: extractBase64Data(photo)
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: prompt
      });
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: messages,
      system: getSystemPrompt(isPremium)
    });

    // Parse the response
    const ideas = parseIdeasFromResponse(response.content[0].text);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ideas })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate ideas' })
    };
  }
};

function getSystemPrompt(isPremium) {
  const base = `You are a creative Elf on the Shelf idea generator. You help parents come up with fun, safe, and age-appropriate elf positioning ideas.

Your ideas should be:
- Safe and parent-friendly (no dangerous setups)
- Easy to set up in 5-10 minutes
- Use common household items when possible
- Whimsical and fun for children
- Varied in complexity and creativity

Always respond with exactly 3 ideas in valid JSON format.`;

  if (isPremium) {
    return base + `

As a premium response, make your ideas:
- More creative and unique
- More personalized to the child's interests
- Include environmental elements from any photo provided
- Add extra detail and storytelling elements`;
  }

  return base;
}

function buildPrompt(profile, photo, isPremium) {
  let prompt = 'Generate 3 creative Elf on the Shelf ideas';
  
  if (profile) {
    prompt += ` for a ${profile.age}-year-old`;
    if (profile.gender) {
      prompt += ` ${profile.gender}`;
    }
    if (profile.name) {
      prompt += ` named ${profile.name}`;
    }
    if (profile.interests) {
      prompt += `. They love: ${profile.interests}`;
    }
  }
  
  if (photo && isPremium) {
    prompt += `. Look at this photo of their room/space and incorporate specific items or locations you can see into the ideas.`;
  }
  
  prompt += `

Respond ONLY with valid JSON in this exact format:
{
  "ideas": [
    {
      "id": 1,
      "title": "Short catchy title",
      "description": "2-3 sentences describing the setup and what it looks like",
      "materials": ["item1", "item2", "item3"]
    }
  ]
}`;

  return prompt;
}

function parseIdeasFromResponse(text) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.ideas.map((idea, index) => ({
        ...idea,
        id: Date.now() + index
      }));
    }
  } catch (e) {
    console.error('Failed to parse ideas:', e);
  }
  
  // Fallback ideas if parsing fails
  return [
    {
      id: Date.now() + 1,
      title: "Marshmallow Bath",
      description: "Place your elf in a small bowl filled with mini marshmallows, as if taking a fluffy bubble bath. Add a tiny paper umbrella for extra fun!",
      materials: ["Small bowl", "Mini marshmallows", "Paper umbrella"]
    },
    {
      id: Date.now() + 2,
      title: "Book Tower Climber",
      description: "Stack several books into a tower and position your elf as if climbing up, with a tiny flag at the top. Leave a note saying 'Summit achieved!'",
      materials: ["5-6 books", "Small flag or paper", "String (optional)"]
    },
    {
      id: Date.now() + 3,
      title: "Fruit Loop Garland Maker",
      description: "Set up your elf with a needle and thread, stringing Fruit Loops into a garland. Scatter some loops around for a fun craft scene.",
      materials: ["Fruit Loops cereal", "String", "Blunt needle"]
    }
  ];
}

function getImageMediaType(dataUrl) {
  if (dataUrl.includes('image/png')) return 'image/png';
  if (dataUrl.includes('image/gif')) return 'image/gif';
  if (dataUrl.includes('image/webp')) return 'image/webp';
  return 'image/jpeg';
}

function extractBase64Data(dataUrl) {
  return dataUrl.split(',')[1];
}
