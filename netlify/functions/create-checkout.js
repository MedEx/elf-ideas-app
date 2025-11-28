// netlify/functions/create-checkout.js
// This serverless function creates a Stripe checkout session

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { priceType } = JSON.parse(event.body);
    
    // Select the right price ID
    let priceId;
    if (priceType === 'single') {
      priceId = process.env.STRIPE_PRICE_SINGLE;
    } else if (priceType === 'season') {
      priceId = process.env.STRIPE_PRICE_SEASON;
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid price type' })
      };
    }

    // Determine the base URL
    const baseUrl = process.env.URL || 'https://elfontheshelfideas.ai';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}?success=true&type=${priceType}`,
      cancel_url: `${baseUrl}?canceled=true`,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessionId: session.id, url: session.url })
    };

  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
};
