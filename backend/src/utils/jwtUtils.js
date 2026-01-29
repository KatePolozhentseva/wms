
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    roleId: user.role_id,
    role: user.role ? user.role.name : null
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: process.env.JWT_ISSUER || 'warehouse-app'
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: process.env.JWT_ISSUER || 'warehouse-app'
  });
};

const decodeToken = (token) => jwt.decode(token);

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
