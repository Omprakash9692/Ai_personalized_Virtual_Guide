const { generateVivaQuestion, evaluateVivaAnswer } = require('../services/viva.service');

/**
 * Controller to handle POST /api/viva/question
 */
async function handleGetQuestion(req, res) {
  try {
    const { jobRole, round, previousTurns } = req.body;

    const data = await generateVivaQuestion({
      jobRole,
      round,
      previousTurns,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[Interview Controller Error - GetQuestion]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate interview question.',
    });
  }
}

/**
 * Controller to handle POST /api/viva/evaluate
 */
async function handleEvaluateAnswer(req, res) {
  try {
    const { question, studentAnswer, jobRole, round } = req.body;

    if (!question || !studentAnswer) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: "question" and "studentAnswer" fields are required.',
      });
    }

    const scorecard = await evaluateVivaAnswer({
      question,
      studentAnswer,
      jobRole,
      round,
    });

    return res.status(200).json({
      success: true,
      data: scorecard,
    });
  } catch (error) {
    console.error('[Interview Controller Error - EvaluateAnswer]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to evaluate interview answer.',
    });
  }
}

module.exports = {
  handleGetQuestion,
  handleEvaluateAnswer,
};
