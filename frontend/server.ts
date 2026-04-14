import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Kakao Auth Routes
  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
  const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI || `${process.env.APP_URL}/api/auth/kakao/callback`;

  app.get("/api/auth/kakao/url", (req, res) => {
    if (!KAKAO_CLIENT_ID) {
      return res.status(500).json({ error: "KAKAO_CLIENT_ID is not configured in environment variables." });
    }
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
    res.json({ url: kakaoAuthUrl });
  });

  app.get("/api/auth/kakao/callback", async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.redirect("/login?error=no_code");
    }

    try {
      // 1. Exchange code for access token
      const tokenResponse = await axios.post(
        "https://kauth.kakao.com/oauth/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          client_id: KAKAO_CLIENT_ID!,
          redirect_uri: KAKAO_REDIRECT_URI,
          code: code as string,
        }).toString(),
        {
          headers: {
            "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
          },
        }
      );

      const { access_token } = tokenResponse.data;

      // 2. Get user info from Kakao
      const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const kakaoUser = userResponse.data;
      const uid = `kakao:${kakaoUser.id}`;
      const email = kakaoUser.kakao_account?.email || `${kakaoUser.id}@kakao.com`;
      const displayName = kakaoUser.properties?.nickname || "Kakao User";
      const photoURL = kakaoUser.properties?.profile_image || "";

      // 3. Create or update user in Firebase Auth (optional, but good for custom token)
      // We don't strictly need to create the user in Auth first, 
      // createCustomToken will work and Firebase will create the user on first sign-in.
      
      // 4. Create Firebase Custom Token
      const customToken = await admin.auth().createCustomToken(uid, {
        email,
        displayName,
        photoURL,
        provider: "kakao",
      });

      // 5. Send success message to parent window and close popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'KAKAO_AUTH_SUCCESS', token: '${customToken}' }, '*');
                window.close();
              } else {
                window.location.href = '/login?token=${customToken}';
              }
            </script>
            <p>카카오 로그인 성공! 이 창은 자동으로 닫힙니다.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Kakao Login Error:", error.response?.data || error.message);
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'KAKAO_AUTH_ERROR', error: 'kakao_failed' }, '*');
                window.close();
              } else {
                window.location.href = '/login?error=kakao_failed';
              }
            </script>
            <p>카카오 로그인 실패. 이 창은 자동으로 닫힙니다.</p>
          </body>
        </html>
      `);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
