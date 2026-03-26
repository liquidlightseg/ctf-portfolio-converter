export const generateWriteUp = async (ctfName, scenario, artifacts, apiKey) => {
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
      throw new Error(errorData.error?.message || 'API Error');
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    throw new Error(`API Error: ${error.message}`);
  }
};
