# Elf Ideas AI 🎄

AI-powered Elf on the Shelf idea generator for busy parents.

**Live at:** elfonashelfideas.ai

## Features

- ✨ **AI-Generated Ideas** - Creative, unique elf positioning ideas powered by Claude
- 👶 **Kid Profiles** - Personalized ideas based on age, gender, and interests
- 📸 **Photo Analysis** (Premium) - Upload room photos for environment-specific ideas
- 💾 **Local Storage** - Saves profiles and favorites without requiring an account
- 💳 **Freemium Model** - 3 free ideas/day, premium for unlimited

## Tech Stack

- **Frontend:** Vanilla React (via CDN for simplicity)
- **Backend:** Netlify Functions (serverless)
- **AI:** Claude API (Anthropic)
- **Payments:** Stripe (to be integrated)
- **Hosting:** Netlify

## Quick Start

### Prerequisites

- Node.js 18+
- Netlify CLI (`npm install -g netlify-cli`)
- Anthropic API key
- Stripe account (for payments)

### Local Development

1. **Clone and install:**
   ```bash
   cd elf-ideas-app
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   STRIPE_SECRET_KEY=your_stripe_key_here
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

3. **Run locally:**
   ```bash
   netlify dev
   ```
   
   This starts the app at `http://localhost:8888`

### Deployment to Netlify

1. **Connect to Netlify:**
   ```bash
   netlify login
   netlify init
   ```

2. **Set environment variables in Netlify:**
   - Go to Site Settings → Environment Variables
   - Add `ANTHROPIC_API_KEY`
   - Add Stripe keys when ready

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

4. **Connect your domain:**
   - In Netlify dashboard, go to Domain Settings
   - Add custom domain: elfonashelfideas.ai
   - Update DNS records as instructed

## Project Structure

```
elf-ideas-app/
├── index.html              # Main app (React SPA)
├── netlify.toml            # Netlify configuration
├── package.json            # Dependencies
├── netlify/
│   └── functions/
│       └── generate-ideas.js   # Claude API endpoint
└── README.md
```

## API Endpoint

### POST /api/generate-ideas

Generates 3 elf positioning ideas.

**Request Body:**
```json
{
  "profile": {
    "name": "Emma",
    "age": 6,
    "gender": "girl",
    "interests": "Frozen, ballet, unicorns"
  },
  "photo": "data:image/jpeg;base64,...",  // Optional, premium only
  "isPremium": false
}
```

**Response:**
```json
{
  "ideas": [
    {
      "id": 1701234567890,
      "title": "Frozen Ice Castle",
      "description": "Build a mini ice castle from sugar cubes...",
      "materials": ["Sugar cubes", "Blue tissue paper", "Glitter"]
    }
  ]
}
```

## Pricing Structure

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 3 ideas/day, 1 profile, no photo analysis |
| Single Use | $3.99 | 3 premium ideas, photo analysis, all profiles |
| Season Pass | $16.99 | Unlimited ideas, photo analysis, cloud sync |

## Stripe Integration (TODO)

To add Stripe checkout:

1. Create products in Stripe Dashboard:
   - "Single Use" - $3.99 one-time
   - "Season Pass" - $16.99 one-time

2. Add a new Netlify function for checkout:
   ```javascript
   // netlify/functions/create-checkout.js
   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
   
   exports.handler = async (event) => {
     const { priceId } = JSON.parse(event.body);
     
     const session = await stripe.checkout.sessions.create({
       payment_method_types: ['card'],
       line_items: [{ price: priceId, quantity: 1 }],
       mode: 'payment',
       success_url: 'https://elfonashelfideas.ai/?success=true',
       cancel_url: 'https://elfonashelfideas.ai/?canceled=true',
     });
     
     return {
       statusCode: 200,
       body: JSON.stringify({ sessionId: session.id })
     };
   };
   ```

3. Add Stripe.js to frontend and handle checkout redirect

## Cost Estimates

### Claude API Costs

- Text-only request: ~$0.01-0.02
- With image: ~$0.03-0.05

### Monthly Projections

| Users | Requests | Est. API Cost |
|-------|----------|---------------|
| 100 | 500 | $5-10 |
| 1,000 | 5,000 | $50-100 |
| 10,000 | 50,000 | $500-1,000 |

Netlify free tier includes 125K function invocations/month.

## Future Enhancements

- [ ] Stripe payment integration
- [ ] User accounts with Supabase
- [ ] Saved ideas cloud sync
- [ ] Daily elf idea email/notification
- [ ] Difficulty rating for ideas
- [ ] Share ideas on social media
- [ ] Advent calendar mode

## License

MIT

---

Made with ❤️ for parents who need one less thing to think about during the holidays.
