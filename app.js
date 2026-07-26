(() => {
  const form = document.querySelector(".detector-card form");
  const textarea = document.querySelector("#message");
  const counter = document.querySelector(".input-meta span:last-child");

  if (!form || !textarea || !counter || form.dataset.ready === "true") return;
  form.dataset.ready = "true";

  const stopWords = new Set(
    "a an and are as at be been being but by can could did do does doing for from had has have having he her hers herself him himself his how i if in into is it its itself just me more most my myself no nor not of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with you your yours yourself yourselves".split(
      " ",
    ),
  );

  const samples = {
    "Prize message":
      "FREE CASH PRIZE! Your ticket was selected for 1,500. Click the link now to claim.",
    "Urgent offer":
      "URGENT! You have won a free membership. Call now to claim your reward.",
    "Team meeting":
      "Hi team, our project sync is tomorrow at 10 AM. Please confirm if you can join.",
  };

  let modelPromise;

  function loadModel() {
    if (!modelPromise) {
      modelPromise = fetch("/spam-guard-ai-detector/spam-model.json").then(
        async (response) => {
          if (!response.ok) throw new Error("Model could not be loaded.");
          return response.json();
        },
      );
    }
    return modelPromise;
  }

  function tokenize(message) {
    return message
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 1 && !stopWords.has(word));
  }

  function classify(message, model) {
    const tokens = tokenize(message);
    const frequencies = new Map();

    for (const token of tokens) {
      frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
    }

    const totalDocuments = model.documentCount[0] + model.documentCount[1];
    const scores = [0, 1].map((label) => {
      let score = Math.log(model.documentCount[label] / totalDocuments);
      const denominator =
        model.totalTokens[label] + model.vocabularySize;

      for (const [word, count] of frequencies) {
        score +=
          count *
          Math.log(((model.wordCounts[label][word] ?? 0) + 1) / denominator);
      }

      return score;
    });

    const maxScore = Math.max(scores[0], scores[1]);
    const legitimate = Math.exp(scores[0] - maxScore);
    const spam = Math.exp(scores[1] - maxScore);
    const spamProbability = spam / (legitimate + spam);
    const isSpam = spamProbability >= 0.5;

    return {
      isSpam,
      confidence: Number(
        ((isSpam ? spamProbability : 1 - spamProbability) * 100).toFixed(2),
      ),
    };
  }

  function updateCounter() {
    counter.textContent = `${textarea.value.length} / 3000`;
  }

  function clearResult() {
    document
      .querySelectorAll(".detector-card .result, .detector-card .error-message")
      .forEach((element) => element.remove());
  }

  function renderResult(result) {
    clearResult();

    const container = document.createElement("div");
    container.className = result.isSpam ? "result spam" : "result safe";
    container.setAttribute("aria-live", "polite");
    container.innerHTML = `
      <div class="result-topline">
        <div class="result-copy">
          <span class="result-icon" aria-hidden="true">${result.isSpam ? "!" : "✓"}</span>
          <div>
            <span class="eyebrow">Analysis complete</span>
            <h3>${result.isSpam ? "Spam detected" : "Message looks safe"}</h3>
          </div>
        </div>
        <div class="confidence" style="--score: ${Math.round(3.6 * result.confidence)}deg">
          <strong>${Math.round(result.confidence)}%</strong>
          <span>confidence</span>
        </div>
      </div>
      <p class="result-advice">${
        result.isSpam
          ? "Avoid clicking links or sharing personal information. Verify the sender independently."
          : "This message resembles legitimate communication, but always verify unexpected requests."
      }</p>
    `;
    form.insertAdjacentElement("afterend", container);
  }

  function renderError() {
    clearResult();
    const error = document.createElement("p");
    error.className = "error-message";
    error.setAttribute("role", "alert");
    error.textContent =
      "The message could not be analyzed. Please refresh and try again.";
    form.insertAdjacentElement("afterend", error);
  }

  textarea.addEventListener("input", () => {
    updateCounter();
    clearResult();
  });

  document.querySelectorAll(".sample-row button").forEach((button) => {
    button.addEventListener("click", () => {
      const message = samples[button.textContent.trim()];
      if (!message) return;
      textarea.value = message;
      updateCounter();
      clearResult();
      textarea.focus();
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!textarea.value.trim()) return;

    const submitButton = form.querySelector(".analyze-button");
    const originalText = submitButton.querySelector("span")?.textContent;
    submitButton.disabled = true;
    if (submitButton.querySelector("span")) {
      submitButton.querySelector("span").textContent = "Analyzing message...";
    }

    try {
      const model = await loadModel();
      renderResult(classify(textarea.value, model));
    } catch {
      renderError();
    } finally {
      submitButton.disabled = false;
      if (submitButton.querySelector("span")) {
        submitButton.querySelector("span").textContent =
          originalText || "Analyze message";
      }
    }
  });

  updateCounter();
})();
