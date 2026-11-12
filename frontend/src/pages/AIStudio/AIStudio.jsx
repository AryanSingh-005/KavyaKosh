import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectorGroup, { EMOTIONS, LANGUAGES, THEMES, FORMS } from '../../components/ai/SelectorGroup';
import PoemResultCard from '../../components/ai/PoemResultCard';
import GenerationHistoryDrawer from '../../components/ai/GenerationHistoryDrawer';
import { generatePoem, rewritePoem, getAiHistory, deleteAiHistoryItem } from '../../api/aiApi';
import { usePremium } from '../../context/PremiumContext';
import './AIStudio.css';

const SAMPLE_PROMPTS = [
  "Dil ka dard aur tanhai ki raat (Shayari)",
  "Mohabbat mein judai ka gham (Ghazal)",
  "Raindrops on ancient cobblestones of Banaras",
  "Ek diye ki lau aur andhere ka sangharsh (Doha)",
  "Sufi ishq aur rooh ki talaash (Qawwali)",
  "Yaadein jo kabhi nahi jaati (Nazm)",
];

const AIStudio = () => {
  const navigate = useNavigate();
  const { tier, features, refreshSubscription } = usePremium();
  const [activeMode, setActiveMode] = useState('GENERATE'); // GENERATE | REWRITE

  // Generation state
  const [prompt, setPrompt] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('ROMANTIC');
  const [selectedLanguage, setSelectedLanguage] = useState('HINDI');
  const [selectedTheme, setSelectedTheme] = useState('LOVE');
  const [selectedForm, setSelectedForm] = useState('SHAYARI');
  const [stanzaCount, setStanzaCount] = useState(3);

  // Rewrite state
  const [originalText, setOriginalText] = useState('');
  const [rewriteInstruction, setRewriteInstruction] = useState('Elevate vocabulary and poetic rhythm');

  // Execution state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // History state
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getAiHistory();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (err) {
      console.warn('Could not load AI history:', err.message);
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) {
      setError('Please provide a topic or prompt for your poem.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generatePoem({
        prompt: prompt.trim(),
        emotion: selectedEmotion,
        language: selectedLanguage,
        theme: selectedTheme,
        form: selectedForm,
        stanzaCount
      });
      setResult(data);
      fetchHistory(); // refresh history drawer
      refreshSubscription(); // refresh daily generation limit status
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg && !msg.toLowerCase().includes('ai generation failed')) {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async (e) => {
    e?.preventDefault();
    if (!originalText.trim()) {
      setError('Please provide the original poem text to polish.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await rewritePoem({
        originalText: originalText.trim(),
        instruction: rewriteInstruction.trim(),
        targetEmotion: selectedEmotion,
        targetLanguage: selectedLanguage
      });
      setResult(data);
      fetchHistory();
      refreshSubscription();
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg && !msg.toLowerCase().includes('ai generation failed')) {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendToPublish = (poemText, meta) => {
    navigate('/publish', { state: { prefillText: poemText, prefillForm: meta?.type, prefillLanguage: meta?.language } });
  };

  const handleSendToPolisher = (poemText) => {
    setOriginalText(poemText);
    setActiveMode('REWRITE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistoryItem = (item) => {
    setResult({
      historyId: item.id,
      type: item.type,
      generatedText: item.resultText,
      emotion: item.emotion,
      language: item.language,
      theme: item.theme,
      prompt: item.prompt,
      createdAt: item.createdAt
    });
    setHistoryOpen(false);
  };

  const handleDeleteHistoryItem = async (id) => {
    try {
      await deleteAiHistoryItem(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  return (
    <div className="ai-studio-page">
      <div className="ai-studio-container">
        
        {/* Header */}
        <header className="ai-studio-header">
          <div className="header-badge">✨ KavyaKosh AI Studio</div>
          <h1 className="ai-studio-title">AI Poetry Workshop & Generator</h1>
          <p className="ai-studio-subtitle">
            Compose authentic Hindi, Urdu, Ghazals & Multi-lingual poetry powered by specialized generative LLMs.
          </p>

          <div className="header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.35rem 0.75rem', borderRadius: '20px', color: '#e2e8f0' }}>
              Plan: <strong style={{ color: tier === 'PRO' ? '#eab308' : tier === 'LITE' ? '#a855f7' : '#94a3b8' }}>{tier}</strong> ({features.dailyAiGenerations === -1 ? 'Unlimited' : `${features.dailyAiGenerations}/day`})
            </span>
            {tier === 'FREE' && (
              <button
                type="button"
                className="history-toggle-btn"
                style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff', border: 'none' }}
                onClick={() => navigate('/premium')}
              >
                👑 Upgrade Plan
              </button>
            )}
            <button
              type="button"
              className="history-toggle-btn"
              onClick={() => setHistoryOpen(true)}
            >
              📜 History ({history.length})
            </button>
          </div>
        </header>

        {/* Mode Switcher */}
        <div className="mode-switcher">
          <button
            type="button"
            className={`mode-btn ${activeMode === 'GENERATE' ? 'mode-btn--active' : ''}`}
            onClick={() => setActiveMode('GENERATE')}
          >
            ✨ Generate New Verse
          </button>
          <button
            type="button"
            className={`mode-btn ${activeMode === 'REWRITE' ? 'mode-btn--active' : ''}`}
            onClick={() => setActiveMode('REWRITE')}
          >
            🖋️ AI Polisher & Rewrite
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="ai-studio-content">
          
          {/* Controls Panel */}
          <div className="studio-panel studio-panel--controls">
            
            {activeMode === 'GENERATE' ? (
              <form onSubmit={handleGenerate} className="studio-form">
                <SelectorGroup
                  title="Emotion / Ras"
                  options={EMOTIONS}
                  selectedValue={selectedEmotion}
                  onChange={setSelectedEmotion}
                  icon="🎭"
                />

                <SelectorGroup
                  title="Language / Bhasha"
                  options={LANGUAGES}
                  selectedValue={selectedLanguage}
                  onChange={setSelectedLanguage}
                  icon="🗣️"
                />

                <SelectorGroup
                  title="Theme / Vishay"
                  options={THEMES}
                  selectedValue={selectedTheme}
                  onChange={setSelectedTheme}
                  icon="🌿"
                />

                <SelectorGroup
                  title="Poetic Form"
                  options={FORMS}
                  selectedValue={selectedForm}
                  onChange={setSelectedForm}
                  icon="✒️"
                />

                <div className="prompt-input-group">
                  <label className="input-label">
                    <span>Stanzas / Shers — <strong style={{color:'#ffd700'}}>{stanzaCount}</strong></span>
                  </label>
                  <input
                    type="range" min={1} max={7} step={1}
                    value={stanzaCount}
                    onChange={(e) => setStanzaCount(Number(e.target.value))}
                    className="stanza-slider"
                  />
                  <div className="stanza-labels">
                    {[1,2,3,4,5,6,7].map(n => (
                      <span key={n} style={{color: n === stanzaCount ? '#ffd700' : '#475569'}}>{n}</span>
                    ))}
                  </div>
                </div>

                <div className="prompt-input-group">
                  <label htmlFor="promptInput" className="input-label">
                    <span>Topic / Prompt / Core Idea</span>
                  </label>
                  <textarea
                    id="promptInput"
                    className="studio-textarea"
                    rows={4}
                    placeholder="Describe the mood, story, or central metaphor (e.g. 'A lonely rainy evening reminiscing youth')..."
                    value={prompt}
                    onChange={(e) => { setPrompt(e.target.value); setError(null); }}
                  />

                  {/* Sample prompts */}
                  <div className="prompt-suggestions">
                    <span className="suggestions-title">Try an idea:</span>
                    {SAMPLE_PROMPTS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="suggestion-chip"
                        onClick={() => setPrompt(sample)}
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <div className="studio-error">{error}</div>}

                <button
                  type="submit"
                  className="generate-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-text">✨ Weaving Verses...</span>
                  ) : (
                    '✨ Compose Poem'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRewrite} className="studio-form">
                <div className="prompt-input-group">
                  <label htmlFor="originalTextInput" className="input-label">
                    <span>Original Poem Text</span>
                  </label>
                  <textarea
                    id="originalTextInput"
                    className="studio-textarea"
                    rows={6}
                    placeholder="Paste your draft poem here..."
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                  />
                </div>

                <div className="prompt-input-group">
                  <label htmlFor="instructionInput" className="input-label">
                    <span>Polishing Instruction</span>
                  </label>
                  <input
                    id="instructionInput"
                    type="text"
                    className="studio-input"
                    placeholder="e.g. 'Make it more melancholic', 'Add rhyming Ghazal couplets', 'Translate to Urdu'"
                    value={rewriteInstruction}
                    onChange={(e) => setRewriteInstruction(e.target.value)}
                  />
                </div>

                <SelectorGroup
                  title="Target Emotion"
                  options={EMOTIONS}
                  selectedValue={selectedEmotion}
                  onChange={setSelectedEmotion}
                  icon="🎭"
                />

                <SelectorGroup
                  title="Target Language"
                  options={LANGUAGES}
                  selectedValue={selectedLanguage}
                  onChange={setSelectedLanguage}
                  icon="🗣️"
                />

                {error && <div className="studio-error">{error}</div>}

                <button
                  type="submit"
                  className="generate-submit-btn generate-submit-btn--purple"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-text">🖋️ Polishing Verses...</span>
                  ) : (
                    '🖋️ Polish & Rewrite'
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Output / Preview Panel */}
          <div className="studio-panel studio-panel--output">
            {loading ? (
              <div className="studio-loading">
                <div className="quill-loader">✒️</div>
                <p className="loading-msg">Summoning poetic inspiration...</p>
                <div className="shimmer-line"></div>
                <div className="shimmer-line shimmer-line--short"></div>
              </div>
            ) : result ? (
              <PoemResultCard
                result={result}
                onSendToPolisher={handleSendToPolisher}
                onSendToPublish={handleSendToPublish}
              />
            ) : (
              <div className="studio-empty-state">
                <div className="empty-icon">🕯️</div>
                <h3>Your Canvas Awaits</h3>
                <p>Select your desired mood, language, and theme on the left to generate authentic verses.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* History Drawer */}
      <GenerationHistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelectHistory={handleSelectHistoryItem}
        onDeleteHistory={handleDeleteHistoryItem}
      />
    </div>
  );
};

export default AIStudio;
