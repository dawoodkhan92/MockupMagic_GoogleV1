# MockupMagic: AI-Powered Product Photography 🪄

MockupMagic is an AI-powered tool that empowers small businesses, Etsy sellers, and entrepreneurs to create stunning, professional-grade product photos in seconds. Simply upload an image of your product, describe a scene, and let the Gemini API generate a beautiful, studio-quality mockup.

### 🚀 [Live Demo Link](https://copy-of-mockupmagic-professional-product-photos-882767993889.us-west1.run.app/)
### 🎥 [Video Demo Link (Coming Soon)]()

---

## The Problem

High-quality product photography is expensive and time-consuming, creating a significant barrier for new businesses. MockupMagic levels the playing field, making it effortless to produce an endless variety of marketing visuals without needing a camera or a studio.

## Core Features

MockupMagic leverages the advanced, multi-turn image generation capabilities of the Gemini API to create a magical user experience.

### 1. Seamless Image Fusion
Upload your product image (ideally with a transparent background) and describe your ideal setting. MockupMagic's core generation engine uses the Gemini model to intelligently place your product into the described scene, automatically handling lighting, shadows, and perspective to create a photorealistic composite.

![Feature 1 - Image Fusion](https://storage.googleapis.com/aistudio-hosting/project-assets/5a918a28-6623-450f-8700-1c0b3b426ba8/readme_feature_1.gif)

### 2. Conversational, Iterative Editing
The first result is just the beginning. Engage in a conversation with the AI to perfect your image. Use the refinement bar to make incremental changes like "Make the lighting warmer," "Add a small plant in the background," or "Change the angle to a top-down view." The AI edits the *most recent image*, ensuring consistency and allowing you to fine-tune your mockup with unprecedented control.

![Feature 2 - Iterative Editing](https://storage.googleapis.com/aistudio-hosting/project-assets/5a918a28-6623-450f-8700-1c0b3b426ba8/readme_feature_2.gif)

### 3. AI-Powered Prompt Enhancement
Not sure how to describe a professional scene? Just write a simple idea like "on a marble table." Our AI Prompt Enhancer will automatically expand it into a detailed, professional photography prompt, incorporating details about camera angles, lens effects (like bokeh), and lighting to yield superior results.

---

## Gemini 2.5 Flash Image Integration

*This write-up is provided for the hackathon submission.*

MockupMagic's core functionality is built directly upon the unique **conversational and image-editing capabilities** of the `gemini-2.5-flash-image-preview` model.

The application's magic stems from two key features. First, the initial mockup generation uses **Image+Text-to-Image Fusion**. We provide the user's product photo and an AI-enhanced text prompt, and Gemini creates a seamless, photorealistic composition. This goes beyond simple image generation by intelligently integrating an existing visual element into a new scene.

Second, and most critically, the app's refinement feature is a direct implementation of **Multi-Turn Image Editing**. Each time a user provides a refinement instruction (e.g., "add a shadow"), we send the *previously generated mockup* along with the new text prompt back to the API. This ability to iteratively build upon the last output is central to the user experience, allowing for a natural, conversational workflow to perfect the image. This transforms the tool from a simple generator into a powerful, interactive visual editor, showcasing the model's advanced contextual understanding and editing prowess.

---

## Tech Stack

- **AI Model:** Google Gemini API (`gemini-2.5-flash-image-preview`, `gemini-2.5-flash`)
- **Framework:** React with TypeScript
- **Styling:** Tailwind CSS
- **API Client:** `@google/genai`

## Getting Started

To run this project locally, you'll need Node.js and a Gemini API key.

1.  **Clone the repository:**
    ```bash
    git clone [repository-url]
    cd [repository-name]
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your API Key:**
    The application is configured to use the AI Studio Apps secret `API_KEY`. When running locally you can create a `.env` file in the root of the project and add your key:
    ```
    API_KEY=your_gemini_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

This will start the application on your local machine, typically at `http://localhost:5173`.
