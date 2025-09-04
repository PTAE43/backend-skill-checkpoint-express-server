export const validateAnswerBody = (req, res, next) => {

    const content = (req.body.content);
    if (!content) {
        return res.status(400).json({
            message: "Invalid request data.",
        });
    }

    res.locals.content = content;
    next();
};

// next();