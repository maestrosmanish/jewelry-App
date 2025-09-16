export const isAdmin = (req, res, next) => {
  console.log(req.user.role,req.user.id)
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only!" });
  }
  next();
};
