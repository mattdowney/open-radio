# MD Radio

An immersive online radio experience built with Next.js and YouTube API.

## Features

- Seamless music streaming using YouTube as a source
- Beautiful blurred album art backgrounds
- Real-time listener count showing how many people are enjoying the radio with you
- Track information with artist and title
- Upcoming tracks queue
- Volume control and playback controls

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your YouTube API key
   - Configure Firebase for real-time features (see below)
4. Run the development server: `npm run dev`

## Firebase Setup for Real-Time Features

The real-time listener count requires Firebase Realtime Database.

For complete setup instructions, see [Firebase Setup Guide](./docs/FIREBASE_SETUP.md).

## Tech Stack

- Next.js 13+ with App Router
- React 18
- TypeScript
- Tailwind CSS
- YouTube API
- Firebase Realtime Database for social features

## License

MIT

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
