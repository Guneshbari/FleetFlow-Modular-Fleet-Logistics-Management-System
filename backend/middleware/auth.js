const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fleetflow-secret-key-2026";

/**
 * JWT Authentication Middleware.
 * Verifies Bearer token and attaches user info to req.user.
 * Falls back to x-role header for backward compatibility (E2E tests).
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // { id, email, role }
      req.userRole = decoded.role;
      return next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  }

  // Fallback: x-role header (backward compatibility for tests / dev)
  const role = req.headers["x-role"];
  if (role) {
    req.userRole = role;
    req.user = { id: 0, email: "dev@fleetflow.com", role };
    return next();
  }

  return res.status(401).json({ error: "Authentication required" });
}

/**
 * RBAC Middleware — checks req.userRole against allowed roles.
 * Must be used AFTER authenticateToken.
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const role = req.userRole;

    if (!role) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        error: `Forbidden. Requires one of: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
}

module.exports = { authenticateToken, requireRole };
