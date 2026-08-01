import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { VerificationToken } from '../entities/VerificationToken';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { EmailService } from './email.service';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private tokenRepository = AppDataSource.getRepository(VerificationToken);
  private emailService = new EmailService();

  async register(data: any) {
    const existingUsername = await this.userRepository.findOneBy({ username: data.username });
    if (existingUsername) throw new Error('Usuario existente');

    const existingEmail = await this.userRepository.findOneBy({ email: data.email });
    if (existingEmail) throw new Error('Correo existente');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user: User = this.userRepository.create({
      ...data,
      password_hash: hashedPassword
    } as Partial<User>);

    await this.userRepository.save(user);

    // Generate 6-digit OTP Verification Code
    const tokenStr = Math.floor(100000 + Math.random() * 900000).toString();
    const token = this.tokenRepository.create({
      user: { id: user.id },
      token: tokenStr,
      type: 'EMAIL_VERIFICATION',
      medium: 'EMAIL',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
    });
    await this.tokenRepository.save(token);

    await this.emailService.sendVerificationEmail(user.email, tokenStr);

    return { message: 'User registered. Please verify your email.', userId: user.id };
  }

  async login(username: string, pass: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: { roles: true }
    });
    if (!user) throw new Error('Invalid credentials');

    if (!user.is_active) throw new Error('User account is disabled');

    const isValid = await bcrypt.compare(pass, user.password_hash);
    if (!isValid) throw new Error('Invalid credentials');

    if (!user.is_email_verified) throw new Error('Email not verified');

    const signOptions: jwt.SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as jwt.SignOptions['expiresIn']
    };
    const token = jwt.sign(
      { id: user.id, username: user.username, type: user.user_type, roles: user.roles ? user.roles.map(r => r.name) : [] },
      process.env.JWT_SECRET || 'secret',
      signOptions
    );

    return { token, user: { id: user.id, username: user.username, email: user.email, first_name: user.first_name, roles: user.roles ? user.roles.map(r => r.name) : [] } };
  }

  async verifyEmail(email: string, tokenStr: string) {
    const foundToken = await this.tokenRepository.findOne({
      where: { token: tokenStr, type: 'EMAIL_VERIFICATION', is_used: false },
      relations: { user: true }
    });

    if (!foundToken) throw new Error('Invalid or expired verification token');
    if (foundToken.expires_at < new Date()) throw new Error('Token has expired');
    if (foundToken.user.email !== email) throw new Error('Token does not match email');

    foundToken.is_used = true;
    await this.tokenRepository.save(foundToken);

    foundToken.user.is_email_verified = true;
    await this.userRepository.save(foundToken.user);

    return { message: 'Email verified successfully' };
  }

  async requestPasswordRecovery(email?: string, phone?: string) {
    let user;
    if (email) {
      user = await this.userRepository.findOneBy({ email });
    } else if (phone) {
      user = await this.userRepository.findOneBy({ phone });
    }

    if (!user) throw new Error('User not found');

    const tokenStr = randomBytes(32).toString('hex');
    const token = this.tokenRepository.create({
      user: { id: user.id },
      token: tokenStr,
      type: 'PASSWORD_RECOVERY',
      medium: email ? 'EMAIL' : 'SMS',
      expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
    });
    await this.tokenRepository.save(token);

    return { message: 'Recovery token generated', token: tokenStr };
  }

  async resetPassword(tokenStr: string, newPassword: string) {
    const foundToken = await this.tokenRepository.findOne({
      where: { token: tokenStr, type: 'PASSWORD_RECOVERY', is_used: false },
      relations: { user: true }
    });

    if (!foundToken) throw new Error('Invalid or expired recovery token');
    if (foundToken.expires_at < new Date()) throw new Error('Token has expired');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    foundToken.user.password_hash = hashedPassword;
    await this.userRepository.save(foundToken.user);

    foundToken.is_used = true;
    await this.tokenRepository.save(foundToken);

    return { message: 'Password updated successfully' };
  }
}

