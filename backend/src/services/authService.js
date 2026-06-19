import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import StaffRepository from '../repositories/staffRepository.js';

class AuthService {
  constructor() {
    this.staffRepo = new StaffRepository();
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (global.MOCK_DB_MODE) {
      if (email === 'superadmin@prajnaerp.com' && password === 'superadmin') {
        const payload = {
          id: 1,
          email: 'superadmin@prajnaerp.com',
          name: 'Super Admin (Mock)',
          role: 'Super Admin',
          role_slug: 'superadmin',
          is_superadmin: 1
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'prajnaerp_secret_key_2026', { expiresIn: '8h' });
        return { token, user: payload };
      }
      if (email === 'admin@prajnaerp.com' && password === 'admin') {
        const payload = {
          id: 3,
          email: 'admin@prajnaerp.com',
          name: 'Admin (Mock)',
          role: 'Admin',
          role_slug: 'admin',
          is_superadmin: 0
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'prajnaerp_secret_key_2026', { expiresIn: '8h' });
        return { token, user: payload };
      }
      throw new Error('Invalid email or password (Mock Mode)');
    }

    const staff = await this.staffRepo.getByEmail(email);
    if (!staff) {
      throw new Error('Invalid email or password');
    }

    if (parseInt(staff.is_active) !== 1) {
      throw new Error('Account is deactivated');
    }

    // legacy PHP CodeIgniter bcrypt hashes use the $2y$ prefix,
    // which node's bcrypt/bcryptjs needs normalized to $2a$ to verify.
    const normalizedHash = staff.password.replace(/^\$2y\$/, '$2a$');
    const isMatch = await bcrypt.compare(password, normalizedHash);
    
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const roleInfo = await this.staffRepo.getStaffRole(staff.id);

    // Create JWT Token
    const payload = {
      id: staff.id,
      email: staff.email,
      name: `${staff.name} ${staff.surname}`.trim(),
      role: roleInfo ? roleInfo.name : 'Staff',
      role_slug: roleInfo ? roleInfo.slug : 'staff',
      is_superadmin: roleInfo ? parseInt(roleInfo.is_superadmin) : 0
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'prajnaerp_secret_key_2026',
      { expiresIn: '8h' }
    );

    return {
      token,
      user: payload
    };
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'prajnaerp_secret_key_2026');
      return decoded;
    } catch (err) {
      throw new Error('Invalid session token');
    }
  }
}

export default AuthService;
