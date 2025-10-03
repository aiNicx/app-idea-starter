<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1tW1Uvf_5AHIuHwgHCm7vWMI-gyOul5PJ

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Convex:
   ```bash
   npx convex dev
   ```
   This will create a `.env.local` file with your Convex URL.

3. (Optional) Set up OpenRouter API key for AI features:
   Add `OPENROUTER_API_KEY=your_api_key_here` to your `.env.local` file

4. Run the app:
   ```bash
   npm run dev
   ```

## Features

- **Authentication**: Simple email/password signup and login
- **Project Management**: Create, edit, and delete projects
- **Document Generation**: Generate frontend, CSS, backend, and database documentation
- **Multi-language Support**: Italian and English
- **Real-time Updates**: Powered by Convex
