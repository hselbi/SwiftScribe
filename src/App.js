// App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import {
  FaKeyboard,
  FaRedo,
  FaTrophy,
  FaExclamationCircle,
} from "react-icons/fa";

const DIFFICULTY_SETTINGS = {
  noob: { time: 60, label: "Noob", minWPM: 0, maxWPM: 30 },
  intermediate: { time: 45, label: "Intermediate", minWPM: 31, maxWPM: 60 },
  pro: { time: 30, label: "Pro", minWPM: 61, maxWPM: Infinity },
};

const BRAND = {
  name: "SwiftScribe",
  tagline: "Master the Art of Speed Typing",
  theme: {
    primary: "#667eea",
    secondary: "#764ba2",
    success: "#48bb78",
    error: "#f56565",
  },
};

function App() {
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [difficulty, setDifficulty] = useState("noob");
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_SETTINGS.noob.time);
  const [failed, setFailed] = useState(false);

  const fetchQuote = async () => {
    const options = {
      method: "GET",
      headers: {
        accept: "*/*",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      },
    };

    try {
      const response = await fetch(
        "https://quoteslate.vercel.app/api/quotes/random",
        options
      );
      if (!response.ok) throw new Error("Failed to fetch quote");
      const data = await response.json();
      setText(data.quote || "The quick brown fox jumps over the lazy dog.");
    } catch (error) {
      console.error("Error:", error);
      setText("The quick brown fox jumps over the lazy dog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  useEffect(() => {
    let intervalId;
    if (isActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false);
            setShowResult(true);
            checkResult();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isActive, timeLeft]);

  const calculateStats = (input) => {
    const words = input.trim().split(" ").length;
    const minutes = (DIFFICULTY_SETTINGS[difficulty].time - timeLeft) / 60;
    const wpm = Math.round(words / minutes) || 0;

    let correct = 0;
    input.split("").forEach((char, index) => {
      if (char === text[index]) correct++;
    });
    const acc = Math.round((correct / input.length) * 100) || 100;

    setWpm(wpm);
    setAccuracy(acc);
  };

  const checkResult = () => {
    const { minWPM, maxWPM } = DIFFICULTY_SETTINGS[difficulty];
    setFailed(wpm < minWPM || accuracy < 90);
  };

  const handleInput = (e) => {
    if (!isActive) setIsActive(true);
    const value = e.target.value;
    setUserInput(value);
    calculateStats(value);

    if (value.length === text.length) {
      setIsActive(false);
      setShowResult(true);
      checkResult();
    }
  };

  const changeDifficulty = (level) => {
    setDifficulty(level);
    setTimeLeft(DIFFICULTY_SETTINGS[level].time);
    reset();
  };

  const reset = () => {
    setUserInput("");
    setIsActive(false);
    setWpm(0);
    setAccuracy(100);
    setLoading(true);
    setShowResult(false);
    setFailed(false);
    setTimeLeft(DIFFICULTY_SETTINGS[difficulty].time);
    fetchQuote();
  };

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <FaKeyboard className="keyboard-icon" />
          <div className="brand-text">
            <h1>{BRAND.name}</h1>
            <p className="tagline">{BRAND.tagline}</p>
          </div>
        </div>
      </div>

      <div className="difficulty-selector">
        {Object.entries(DIFFICULTY_SETTINGS).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => changeDifficulty(key)}
            className={`difficulty-button ${
              difficulty === key ? "active" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">
          <div className="loader"></div>
          <p>Loading challenge...</p>
        </div>
      ) : !showResult ? (
        <>
          <div className="stats-container">
            <div className="stat-box">
              <span className="stat-label">WPM</span>
              <span className="stat-value">{wpm}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Time Left</span>
              <span className="stat-value">{timeLeft}s</span>
            </div>
          </div>

          <div className="quote-box">
            {text.split("").map((char, index) => (
              <span
                key={index}
                className={
                  index < userInput.length
                    ? char === userInput[index]
                      ? "correct"
                      : "incorrect"
                    : ""
                }
              >
                {char}
              </span>
            ))}
          </div>

          <textarea
            value={userInput}
            onChange={handleInput}
            placeholder={`Start typing to begin... (${DIFFICULTY_SETTINGS[difficulty].label} Mode)`}
            className="input-area"
            disabled={timeLeft === 0}
          />
        </>
      ) : (
        <div className="result-container">
          {failed ? (
            <FaExclamationCircle className="fail-icon" />
          ) : (
            <FaTrophy className="trophy-icon" />
          )}
          <h2>{failed ? "Try Again!" : "Great Job!"}</h2>
          <div className="final-stats">
            <div>Words per minute: {wpm}</div>
            <div>Accuracy: {accuracy}%</div>
            <div>Level: {DIFFICULTY_SETTINGS[difficulty].label}</div>
            {failed && (
              <div className="fail-message">
                Required: WPM &gt; {DIFFICULTY_SETTINGS[difficulty].minWPM} and
                Accuracy &gt; 90%
              </div>
            )}
          </div>
        </div>
      )}

      <button onClick={reset} className="reset-button">
        <FaRedo className="reset-icon" />
        Try Again
      </button>
    </div>
  );
}

export default App;
