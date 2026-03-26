export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ctfName, scenario, artifacts } = req.body;
  const apiKey = process.env.REACT_APP_CLAUDE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const systemPrompt = `You are an expert SOC analyst and security writer. Transform raw CTF investigation artifacts into a polished, professional write-up.

Given raw materials (notes, screenshots, queries), generate a write-up with these sections:
1. Objective (what was the challenge?)
2. Methodology (how did you approach it?)
3. Key Findings (what did you discover?)
4. Tools & Techniques (what tools did you use?)
5. What I Learned (key takeaway)

Make it professional, clear, and suitable for a portfolio or LinkedIn post. Use Markdown formatting.`;

  const userMessage = `CTF: ${ctfName}
Scenario: ${scenario}

Raw Artifacts and Notes:
${artifacts}

Generate a professional write-up from this.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: errorData.error?.message || 'API Error',
      });
    }

    const data = await response.json();
    return res.status(200).json({
      writeUp: data.content[0].text,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
```

Save (Ctrl+O, Enter, Ctrl+X).

Then push:
```
git add .
git commit -m "Add API function"
git push
