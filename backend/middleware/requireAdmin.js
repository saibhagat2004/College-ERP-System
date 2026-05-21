
export const requireAdmin = (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorize: No Token Provided" });
        if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden: Admins only" });
        next();
    } catch (error) {
        console.log("Error in requireAdmin middleware", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};