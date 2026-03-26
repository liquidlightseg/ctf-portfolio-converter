import React, { useState } from 'react';
import './App.css';
import { generateWriteUp as callAPI } from './api';

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

      // Call Claude API
      const generatedText = await callAPI(
      ctfName,
      scenario,
      artifacts,
      process.env.REACT_APP_CLAUDE_API_KEY
    );
    setWriteUp(generatedText);
  } catch (err) {
    setError(`Error: ${err.message}`);
    console.error('API Error:', err);
  } finally {
    setLoading(false);
  }
};

  const downloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([writeUp], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${ctfName.replace(/\s+/g, '_')}_writeup.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
            {loading ? 'Generating... (this takes 10-15 seconds)' : 'Generate Write-Up'}
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
            <button onClick={downloadMarkdown} className="download-btn">
              📥 Download as Markdown
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
