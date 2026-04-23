// ──────────────────────────────────────────────────────────
// Unified AI configuration for the entire ZenCode platform.
//
// Every module (DSA Chat, Resume Analyzer, Aptitude,
// Resume Builder, Mock Interview) reads from the SAME
// two env vars:
//
//   GEMINI_API_KEY   – your Google Gemini API key
//   GEMINI_MODEL     – model name (default: gemini-2.5-flash)
//
// The Resume Builder module needs an OpenAI-compatible
// client, so we also export one pointed at the Gemini
// OpenAI-compatible endpoint.
// ──────────────────────────────────────────────────────────

import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

// ── Google GenAI SDK (used by DSA Chat, Resume Analyzer) ─
export function getGeminiClient() {
  if (!GEMINI_API_KEY) {
    throw Object.assign(
      new Error(
        "AI is not configured. Set GEMINI_API_KEY in the backend .env file."
      ),
      { statusCode: 503 }
    );
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

// ── OpenAI-compatible SDK (used by Resume Builder) ──────
// Google exposes an OpenAI-compatible endpoint at:
//   https://generativelanguage.googleapis.com/v1beta/openai/
export const openaiCompatClient = new OpenAI({
  apiKey: GEMINI_API_KEY || "dummy-key-to-prevent-crash",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});
