import { Router } from "express";
import { ensureAnswerExists } from "../middlewares/ensureAnswerExists.mjs";
import { validateVoteBody } from "../middlewares/validateVoteBody.mjs";
import connectionPool from "../utils/db.mjs";

const answersVoteRouter = Router();

answersVoteRouter.post("/:answerId/vote",
    [ensureAnswerExists, validateVoteBody], async (req, res) => {
        try {
            const { answerId, vote } = res.locals;

            await connectionPool.query(
                `
        INSERT INTO answer_votes (answer_id , vote)
        VALUES ($1,$2)
        RETURNING *
      `,
                [answerId, vote]
            );

            return res.status(201).json({
                message: "Vote on the answer has been recorded successfully.",
            });

        } catch (error) {
            return res.status(500).json({
                message: `Unable to vote answer. Error: ${error.message}`,
            });
        }
    });

export default answersVoteRouter;