import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { VerificationToken } from '../entities/VerificationToken';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private tokenRepository = AppDataSource.getRepository(VerificationToken);

  async register(data: any) {
    const existing = await this.userRepository.findOneBy({ username: data.username });
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user: User = this.userRepository.create({
      ...data,
      password_hash: hashedPassword
    } as Partial<User>);

    await this.userRepository.save(user);

    // Generate Verification Token
    const tokenStr = randomBytes(32).toString('hex');
    const token = this.tokenRepository.create({
      user: { id: user.id },
      token: tokenStr,
      type: 'EMAIL_VERIFICATION',
      medium: 'EMAIL',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
    });
    await this.tokenRepository.save(token);

    // TODO: Send Email here

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
}
