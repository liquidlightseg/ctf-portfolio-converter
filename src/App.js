import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [ctfName, setCtfName] = useState('');
  const [scenario, setScenario] = useState('');
  const [artifacts, setArtifacts] = useState('');
  const [loading, setLoading] = useState(false);
  const [writeUp, setWriteUp] = useState('');
  const [error, setError] = useState('');

  const generateWriteUp = async () => {
    if (!ctfName || !scenario || !artifacts) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setWriteUp('');

    // Check if API key exists
    if (!process.env.REACT_APP_CLAUDE_API_KEY) {
      setError('API key is missing. Please add REACT_APP_CLAUDE_API_KEY to your environment variables.');
      setLoading(false);
      return;
    }

    try {
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

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userMessage,
            },
          ],
        },
        {
          headers: {
            'x-api-key': process.env.REACT_APP_CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        }
      );

      const generatedText = response.data.content[0].text;
      setWriteUp(generatedText);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      setError(`Error: ${errorMessage}`);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadMarkdown = () => {
    if (!writeUp) return;
    
    const element = document.createElement('a');
    const file = new Blob([writeUp], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${ctfName.replace(/\s+/g, '_')}_writeup.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(writeUp);
    alert('Write-up copied to clipboard!');
  };

  return (
    <div className="App">
      <div className="container">
        <h1>CTF to Portfolio Converter</h1>
        <p className="subtitle">Turn your CTF work into polished write-ups</p>

        <div className="form-section">
          <label>
            CTF Name:
            <input
              type="text"
              placeholder="e.g., BotsV1, TryHackMe, HackTheBox"
              value={ctfName}
              onChange={(e) => setCtfName(e.target.value)}
            />
          </label>

          <label>
            Scenario/Challenge:
            <input
              type="text"
              placeholder="e.g., Web Defacement Investigation"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
            />
          </label>

          <label>
            Raw Artifacts & Notes:
            <textarea
              placeholder="Paste your notes, screenshot descriptions, queries, findings, etc."
              value={artifacts}
              onChange={(e) => setArtifacts(e.target.value)}
              rows="10"
            />
          </label>

          <button onClick={generateWriteUp} disabled={loading}>
            {loading ? 'Generating... (10-15 seconds)' : 'Generate Write-Up'}
          </button>

          {error && <div className="error">{error}</div>}
        </div>

        {writeUp && (
          <div className="output-section">
            <h2>Your Write-Up</h2>
            <div className="writeup-content">
              {writeUp.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div className="button-group">
              <button onClick={downloadMarkdown} className="download-btn">
                📥 Download as Markdown
              </button>
              <button onClick={copyToClipboard} className="copy-btn">
                📋 Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
