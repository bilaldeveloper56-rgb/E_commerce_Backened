export const rolemiddleware = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "User not found", success: false });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }
    next();
  } catch (error) {
    next(error);
  }
};
export default rolemiddleware;
