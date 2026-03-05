import Results from "../models/Results.model.js";

export const getResults = async (req, res) => {
    try {
        const { id } = req.user;
        const results = await Results.find
            .find({ studentId: id })
            .populate("courseId", "name code")
            .select("grade semester");
        res.json(results);
    } catch (error) {
        console.error("Get Results Error:", error);
        res.status(500).json({
            message: "Failed to fetch results",
        });
    }
};
