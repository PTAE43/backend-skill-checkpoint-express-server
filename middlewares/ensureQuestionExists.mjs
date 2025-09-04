import connectionPool from "../utils/db.mjs";

export const ensureQuestionExists = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        if (!questionId || Number.isNaN(Number(questionId))) {
            return res.status(400).json({
                message: "Invalid questionId.",
            });
        }

        const result = await connectionPool.query(
            "SELECT id FROM questions WHERE id = $1",
            [Number(questionId)]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Question not found. No questionId",
            });
        }

        res.locals.questionId = Number(questionId);
        next();

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// next();