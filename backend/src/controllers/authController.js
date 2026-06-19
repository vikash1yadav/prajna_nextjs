import AuthService from '../services/authService.js';

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      
      // Set httpOnly cookie for secure session tracking
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60 * 1000 // 8 hours
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          message: error.message || 'Authentication failed'
        }
      });
    }
  };

  me = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      let token = req.cookies?.token;

      if (!token && req.headers.cookie) {
        const parsedCookies = req.headers.cookie.split(';').reduce((acc, c) => {
          const [key, val] = c.trim().split('=');
          if (key && val) acc[key] = val;
          return acc;
        }, {});
        token = parsedCookies.token;
      }

      if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          error: { message: 'No active session found' }
        });
      }

      const decoded = await this.authService.verifyToken(token);
      return res.status(200).json({
        success: true,
        data: decoded
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired session token' }
      });
    }
  };

  logout = async (req, res, next) => {
    res.clearCookie('token');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  };
}

export default AuthController;
