import connectionPool from "../utils/db.mjs";

export const ensureAnswerExists = async (req, res, next) => {
    try {
        const { answerId } = req.params;
        if (!answerId || Number.isNaN(Number(answerId))) {
            return res.status(400).json({
                message: "Invalid answerId.",
            });
        }

        const result = await connectionPool.query(
            "SELECT id FROM answers WHERE id = $1",
            [Number(answerId)]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Answer not found.",
            });
        }

        res.locals.answerId = Number(answerId);
        next();

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// next();