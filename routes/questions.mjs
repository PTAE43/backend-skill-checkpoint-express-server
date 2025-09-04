import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateCreateQuestionData } from "../middlewares/validateCreateQuestion.mjs";
import { ensureQuestionExists } from "../middlewares/ensureQuestionExists.mjs";
import { validateAnswerBody } from "../middlewares/validateAnswerBody.mjs";
import { validateVoteBody } from "../middlewares/validateVoteBody.mjs";

const questionsRouter = Router();

questionsRouter.get("/", async (req, res) => {

  try {
    const result = await connectionPool.query("SELECT * FROM questions");
    return res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Unable to fetch questions. Error : ${error.message} `,
    });
  }
});

questionsRouter.get("/search", async (req, res) => {

  try {
    const { title, category } = req.query;
    if (!title && !category) {
      return res.status(400).json({
        message: "Invalid search parameters.",
      });
    }
    const result = await connectionPool.query(
      `
        SELECT * FROM questions 
        WHERE 
          ($1::text IS NULL OR title ILIKE $1)
          AND
          ($2::text IS NULL OR category ILIKE $2)
      `,
      [
        title ? `%${title}%` : null,
        category ? `%${category}%` : null,
      ]
    );
    return res.status(200).json({
      data: result.rows,
    });

  } catch (error) {
    return res.status(500).json({
      message: `Unable to fetch a question. Error: ${error.message}`,
    });
  }
});

questionsRouter.get("/:questionId(\\d+)", async (req, res) => {

  const questionsIdFromClient = req.params.questionId;
  try {
    const result = await connectionPool.query(
      `
        SELECT * FROM questions WHERE id=$1
      `,
      [questionsIdFromClient]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }
    return res.status(200).json({
      data: result.rows,
    });

  } catch (error) {
    return res.status(500).json({
      message: `Unable to fetch questions. Error: ${error.message}`,
    });
  }
});

questionsRouter.get("/:questionId(\\d+)/answers", async (req, res) => {

  const questionsIdFromClient = req.params.questionId;
  try {
    const result = await connectionPool.query(
      `
        SELECT * FROM answers WHERE question_id=$1
      `,
      [questionsIdFromClient]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }
    return res.status(200).json({
      data: result.rows,
    });

  } catch (error) {
    return res.status(500).json({
      message: `Unable to fetch answers. Error: ${error.message}`,
    });
  }
});

questionsRouter.post("/",
  [validateCreateQuestionData], async (req, res) => {
    try {
      const { title, description, category } = req.body;
      await connectionPool.query(
        `
        INSERT INTO questions (title , description , category)
        VALUES ($1,$2,$3)
        RETURNING *
      `,
        [title, description, category]
      );
      return res.status(201).json({
        message: "Question created successfully.",
      });

    } catch (error) {
      return res.status(500).json({
        message: `Unable to create question. Error: ${error.message}`,
      });
    }
  });

questionsRouter.post("/:questionId/answers",
  [ensureQuestionExists, validateAnswerBody], async (req, res) => {
    try {
      const { questionId, content } = res.locals;

      await connectionPool.query(
        `
        INSERT INTO answers (question_id , content)
        VALUES ($1,$2)
        RETURNING *
      `,
        [questionId, content]
      );

      return res.status(201).json({
        message: "Answer created successfully.",
      });

    } catch (error) {
      return res.status(500).json({
        message: `Unable to create answers. Error: ${error.message}`,
      });
    }
  });

questionsRouter.post("/:questionId/vote",
  [ensureQuestionExists, validateVoteBody], async (req, res) => {
    try {
      const { questionId, vote } = res.locals;

      await connectionPool.query(
        `
        INSERT INTO question_votes (question_id , vote)
        VALUES ($1,$2)
        RETURNING *
      `,
        [questionId, vote]
      );

      return res.status(201).json({
        message: "Vote on the question has been recorded successfully.",
      });

    } catch (error) {
      return res.status(500).json({
        message: `Unable to vote question. Error: ${error.message}`,
      });
    }
  });

questionsRouter.put("/:questionId",
  [ensureQuestionExists, validateCreateQuestionData], async (req, res) => {
    try {
      const { questionId, title, description, category } = res.locals;

      const result = await connectionPool.query(
        `
          UPDATE questions
          SET title = $2,
              description = $3,
              category = $4
          WHERE id = $1
          RETURNING *
        `,
        [questionId, title, description, category]
      );

      return res.status(200).json({
        message: "Question updated successfully.",
      });

    } catch (error) {
      return res.status(500).json({
        message: `Unable to fetch questions. Error: ${error.message}`,
      });
    }
  });

questionsRouter.delete("/:questionId",
  [ensureQuestionExists], async (req, res) => {
    try {
      const { questionId } = res.locals;

      await connectionPool.query(`DELETE FROM answer_votes av USING answers a WHERE av.answer_id = $1`, [questionId]);
      await connectionPool.query(`DELETE FROM answers WHERE question_id = $1`, [questionId]);
      await connectionPool.query(`DELETE FROM question_votes WHERE question_id = $1`, [questionId]);
      await connectionPool.query(`DELETE FROM questions WHERE id = $1`, [questionId]);

      return res.status(200).json({
        message: "Question post has been deleted successfully.",
      });

    } catch (error) {
      return res.status(500).json({
        message: `Unable to delete question. Error: ${error.message}`,
      });
    }
  })

questionsRouter.delete("/:questionId/answers",
  [ensureQuestionExists], async (req, res) => {
    try {
      const { questionId } = res.locals;

      await connectionPool.query(
        `
          DELETE FROM answers
          WHERE question_id = $1
        `,
        [questionId]
      );

      return res.status(200).json({
        message: "All answers for the question have been deleted successfully.",
      });

    } catch (error) {
      return res.status(500).json({
        message: `Unable to delete answers. Error: ${error.message}`,
      });
    }
  })

export default questionsRouter;
