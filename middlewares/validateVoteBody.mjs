export const validateVoteBody = (req, res, next) => {

    const vote = req.body.vote;
    if (vote == null || ![-1, 1].includes(Number(vote))) {
        return res.status(400).json({
            message: "Invalid vote value or Answer not found. and must be -1 or 1",
        });
    }

    res.locals.vote = Number(vote);
    next();

};

// next();