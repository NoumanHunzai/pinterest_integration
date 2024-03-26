// File: server.ts

import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import axios, { AxiosResponse } from "axios";
const dotenv = require("dotenv");
//connect dotenv file
dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/fetchPinterestLink", async (req: Request, res: Response) => {
  try {
    const pinterestAuthUrl = `https://www.pinterest.com/oauth/?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=boards:read,pins:read,pins:write&state=authcode`;

    res.redirect(pinterestAuthUrl);
  } catch (error) {
    console.error("Error redirecting to Pinterest authorization URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/exchangeCodeForAccessToken", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(404).json({ error: "Code not found" });
    }

    const credentials = Buffer.from(
      `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
    ).toString("base64");

    const { data } = await axios.post(
      "https://api.pinterest.com/v5/oauth/token",
      {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
      },
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Store Acesss TOken in the Database
    res.status(200).json({ accessToken: data });
  } catch (error) {
    console.error("Error exchanging code for access token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Image Upload Api

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
