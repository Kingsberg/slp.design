<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/169f6XR8xqdNJrFDp729y_Dw6-gumb-25

## Run Locally

**Prerequisites:** Node.js (v18+ recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Ensure you have a `.env.local` file in the root directory (you can create one if it fits).
   Set your Gemini API key in it:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   *Note: This is required for AI features to work.*

3. **Run the app:**
   Start the development server:
   ```bash
   npm run dev
   ```
   
   Then open [http://localhost:3000](http://localhost:3000) (or the URL shown in your terminal) to view the website.

## View on Mobile / Network

The project is already configured to be accessible on your local network.

1.  **Ensure connectivity:**
    Make sure your computer and mobile device are connected to the **same Wi-Fi network**.

2.  **Find your Network URL:**
    When you run `npm run dev`, look at the terminal output for the **Network** URL. It will look something like:
    ```
    ➜  Network: http://192.168.1.5:3000/
    ```

3.  **Open on Mobile:**
    Type that Network URL (e.g., `http://192.168.1.5:3000`) into your mobile browser.