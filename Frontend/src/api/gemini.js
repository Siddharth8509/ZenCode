export const generateGeminiContent = async ({
    apiKey,
    prompt,
    model = "gemini-1.5-flash",
    temperature = 0.4,
    maxOutputTokens = 1024,
}) => {
    if (!apiKey) {
        throw new Error("Missing API key");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
            generationConfig: {
                temperature,
                topP: 0.95,
                maxOutputTokens,
            },
        }),
    });

    if (!response.ok) {
        let message = "Gemini request failed";
        try {
            const errorData = await response.json();
            message = errorData?.error?.message || message;
        } catch {
            // ignore JSON parsing errors
        }
        throw new Error(message);
    }

    const data = await response.json();
    const text =
        data?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text)
            .filter(Boolean)
            .join("") || "";

    if (!text) {
        throw new Error("No response from Gemini");
    }

    return text;
};
