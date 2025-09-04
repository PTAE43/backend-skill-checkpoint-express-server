export const validateCreateQuestionData = (req, res, next) => {

    const categoryList = [
        "cuisine",
        "history",
        "literature",
        "miscellaneous",
        "movies",
        "music",
        "science",
        "sports",
        "technology",
        "travelling"
    ];
    const hasCategoryList = categoryList.includes(req.body.category);
    if (!hasCategoryList) {
        return res.status(400).json({
            message: "Invalid request data. Please select the correct category, such as cuisine,history,literature,miscellaneous,movies,music,science,sports,technology,traveling."
        });
    }
    const { title, description, category } = req.body || {};
    if (!title || !description || !category) {
        return res.status(400).json({
            message: "⚠️ Please fill in complete information."
        });
    }

    res.locals.title = title;
    res.locals.description = description;
    res.locals.category = category;
    next();
}

// next();