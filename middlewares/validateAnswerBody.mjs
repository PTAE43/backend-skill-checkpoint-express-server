export const validateAnswerBody = (req, res, next) => {

    const content = (req.body.content);
    if (!content) {
        return res.status(400).json({
            message: "Invalid request data.",
        });
    }
    if (req.body.content.length > 300) {
        return res.status(400).json({
            message: "Answers must be a message of no more than 300 characters.",
        });
    }

    res.locals.content = content;
    next();
};

// next();