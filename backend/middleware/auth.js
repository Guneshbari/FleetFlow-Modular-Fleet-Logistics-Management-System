/**
 * Simple RBAC Middleware reading the 'x-role' header.
 * Factory function that accepts allowed roles.
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const role = req.headers["x-role"];

    if (!role) {
      return res.status(401).json({ error: "Missing x-role header" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        error: `Forbidden. Requires one of: ${allowedRoles.join(", ")}`,
      });
    }

    // Attach role to request for downstream handlers if needed
    req.userRole = role;
    next();
  };
}

module.exports = { requireRole };
