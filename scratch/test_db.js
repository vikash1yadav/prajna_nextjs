import jwt from 'jsonwebtoken';

const payload = {
  id: 1,
  email: 'superadmin@prajnaerp.com',
  name: 'Super Admin',
  role: 'Super Admin',
  role_slug: 'superadmin',
  is_superadmin: 1
};

const token = jwt.sign(
  payload,
  'prajnaerp_secret_key_2026',
  { expiresIn: '8h' }
);

console.log('JWT_TOKEN:', token);
console.log('USER_JSON:', JSON.stringify(payload));
process.exit(0);
