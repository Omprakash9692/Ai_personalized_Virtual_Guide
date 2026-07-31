const { generateReply } = require('./groq');

/**
 * Generates a targeted Interview Question based on Job Role and Interview Round.
 * 
 * @param {Object} params
 * @param {string} [params.jobRole='Software Engineer'] - Target Job Role
 * @param {string} [params.round='Technical Round'] - Interview Round ('Aptitude & Reasoning' | 'Technical Round' | 'HR Interview')
 * @param {Array} [params.previousTurns=[]] - Conversation context of previous questions/answers
 * @returns {Promise<Object>} Object containing { question, questionId, topic }
 */
async function generateVivaQuestion({ jobRole = 'Software Engineer', round = 'Technical Round', previousTurns = [] }) {
  let roundInstruction = '';

  if (round === "Aptitude & Reasoning") {
  roundInstruction = `
You are an interviewer conducting an Aptitude & Reasoning round.

Rules:
- Ask ONLY ONE question at a time.
- Difficulty: Easy to Medium.
- Keep the question short (1-3 lines).
- Focus on aptitude topics such as:
  • Quantitative Aptitude
  • Logical Reasoning
  • Number Series
  • Percentages
  • Profit & Loss
  • Time & Work
  • Time, Speed & Distance
  • Probability (basic)
  • Blood Relations
  • Coding-Decoding
  • Seating Arrangement (small)
  • Puzzles (simple)
- Avoid lengthy story-based puzzles.
- Do NOT explain the answer.
- Wait for the candidate's response before asking the next question.
`;
} else if (round === "HR Interview") {
  roundInstruction = `
You are a Senior HR Manager interviewing a candidate for the role of ${jobRole}.

Rules:
- Ask ONLY ONE HR question at a time.
- Keep the question short (1-2 lines).
- Focus on:
  • Self Introduction
  • Strengths & Weaknesses
  • Teamwork
  • Leadership
  • Conflict Resolution
  • Communication
  • Time Management
  • Handling Pressure
  • Career Goals
  • Motivation
  • Behavioral Questions
  • Situational Questions (STAR style)
  • Company & Role Fit
- Do NOT ask technical questions.
- Wait for the candidate's response before asking the next question.
`;
} else {
  roundInstruction = `
You are a Technical Interviewer interviewing a candidate for the role of ${jobRole}.

Rules:
- Ask ONLY ONE technical question at a time.
- Difficulty: Easy to Medium.
- Questions should require a short answer (1-2 lines) or a brief explanation.
- Focus on interview basics rather than deep theory.
- Prefer practical questions commonly asked in interviews.
- Avoid long conceptual discussions, system design, or very difficult problems.
- Examples:
  • What is a REST API?
  • Difference between let and var?
  • What is JWT?
  • What is middleware in Express?
  • What is MongoDB?
  • What is React state?
  • What is closure in JavaScript?
  • What is async/await?
  • Difference between SQL and NoSQL?
- Ask questions relevant to the role: ${jobRole}.
- Wait for the candidate's response before asking the next question.
`;
}

  const systemPrompt = `${roundInstruction}
You are conducting a formal 1-on-1 Mock Interview.

CRITICAL INSTRUCTIONS:
1. Ask ONE clear, challenging, and realistic interview question.
2. Ensure the question is unique and unexpected. Avoid generic or overly common questions unless specifically testing foundations.
3. Do NOT provide the answer or additional conversational filler.
4. Output strictly JSON format:
{
  "question": "Your exact interview question text here",
  "topic": "Specific sub-topic name (e.g. System Design / Conflict Resolution / Probability)",
  "difficulty": "Easy" | "Medium" | "Hard"
}
`;

  const previousSummary = previousTurns.length > 0
    ? `Avoid repeating these previous questions: ${previousTurns.map(t => t.question).join('; ')}`
    : `To ensure variety, randomly pick a sub-topic or specific scenario related to the role. (Randomization Seed: ${Math.random()})`;

  const userMessage = `Ask a high-yield interview question for the role of "${jobRole}" in the "${round}". ${previousSummary}`;

  try {
    const rawReply = await generateReply(userMessage, [], { systemInstruction: systemPrompt });

    let cleaned = rawReply.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    let parsed = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // Fallback if JSON parse fails
      parsed = {
        question: rawReply.replace(/[{}"\n]/g, ' ').trim(),
        topic: round,
        difficulty: 'Medium',
      };
    }

    return {
      question: parsed.question || `Tell me about yourself and your experience relevant to ${jobRole}.`,
      topic: parsed.topic || round,
      difficulty: parsed.difficulty || 'Medium',
      questionId: `interview_${Date.now()}`,
    };
  } catch (error) {
    console.error('[Interview Service - Generate Question Error]:', error);
    throw new Error(`Failed to generate interview question: ${error.message}`);
  }
}

/**
 * Evaluates candidate's spoken/written answer across Technical Correctness, Missed Concepts, Tone, and Model Answer.
 * 
 * @param {Object} params
 * @param {string} params.question - The question asked by examiner
 * @param {string} params.studentAnswer - The transcript/text of student's answer
 * @param {string} [params.jobRole='Software Engineer']
 * @param {string} [params.round='Technical Round']
 * @returns {Promise<Object>} Evaluation scorecard JSON object
 */
async function evaluateVivaAnswer({ question, studentAnswer, jobRole = 'Software Engineer', round = 'Technical Round' }) {
  if (!question || !studentAnswer) {
    throw new Error('Both question and studentAnswer are required for interview evaluation.');
  }

  let evaluationFocus = '';
  if (round === 'Aptitude & Reasoning') {
    evaluationFocus = 'Focus heavily on the logic, step-by-step reasoning, and correct final answer.';
  } else if (round === 'HR Interview') {
    evaluationFocus = 'Focus heavily on communication style, professionalism, confidence, and use of the STAR method (Situation, Task, Action, Result). Technical accuracy is less relevant here.';
  } else {
    evaluationFocus = 'Focus heavily on technical precision, architecture trade-offs, and conceptual depth.';
  }

  const systemPrompt = `You are a senior interviewer evaluating a candidate for the role of "${jobRole}" in the "${round}".
${evaluationFocus}

EVALUATION CRITERIA:
1. Accuracy / Quality (Score out of 10): Is the answer correct, well-structured, and appropriate for the round?
2. Covered Concepts: List exact keywords/concepts the candidate accurately identified or demonstrated.
3. Missed Concepts: List crucial keywords, definitions, logical steps, or STAR method components the candidate missed.
4. Tone & Confidence Feedback: Analyze delivery structure, clarity, confidence, or filler word usage based on the transcript.
5. Model Answer: Provide a concise, top-scoring 10/10 model answer for this specific interview question.
6. Follow-up Question: Formulate a logical follow-up question based on what the candidate missed or to test deeper knowledge.

OUTPUT SCHEMA:
Respond STRICTLY with a valid JSON object. No outer markdown wrapper if possible:
{
  "score": 7.5,
  "grade": "B+" | "A" | "A+" | "C" | "F",
  "summary": "Concise 1-2 sentence overall evaluation",
  "coveredConcepts": ["Concept 1", "Concept 2"],
  "missedConcepts": ["Missed Concept 1", "Missed Concept 2"],
  "toneFeedback": "Constructive feedback on delivery and confidence",
  "modelAnswer": "Clear 10/10 reference answer text",
  "followupQuestion": "Follow-up question string"
}
`;

  const userMessage = `Question: "${question}"
Candidate's Spoken Answer: "${studentAnswer}"

Evaluate this answer now and return the JSON scorecard.`;

  try {
    const rawReply = await generateReply(userMessage, [], { systemInstruction: systemPrompt });

    let cleaned = rawReply.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    let scorecard = {};
    try {
      scorecard = JSON.parse(cleaned);
    } catch (e) {
      console.warn('[Interview Service Warning]: Failed to parse evaluation JSON directly.', e.message);
      // Extraction fallback
      const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scorecard = JSON.parse(jsonMatch[0]);
      } else {
        scorecard = {
          score: 6.0,
          grade: 'B',
          summary: 'Answer covered basic ideas but lacked depth or structure.',
          coveredConcepts: ['Basic response'],
          missedConcepts: ['Key terms or structured reasoning'],
          toneFeedback: 'Tone was acceptable.',
          modelAnswer: rawReply,
          followupQuestion: 'Can you elaborate further on your approach?',
        };
      }
    }

    return scorecard;
  } catch (error) {
    console.error('[Interview Service - Evaluate Answer Error]:', error);
    throw new Error(`Failed to evaluate interview answer: ${error.message}`);
  }
}

module.exports = {
  generateVivaQuestion,
  evaluateVivaAnswer,
};
