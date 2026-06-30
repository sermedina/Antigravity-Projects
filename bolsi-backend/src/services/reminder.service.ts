import { AppDataSource } from '../config/data-source';
import { Reminder } from '../entities/Reminder';
import { User } from '../entities/User';

export class ReminderService {
  private reminderRepo = AppDataSource.getRepository(Reminder);
  private userRepo = AppDataSource.getRepository(User);

  async getReminders(userId: number) {
    return await this.reminderRepo.find({
      where: { user: { id: userId } },
      order: { reminder_date: 'ASC' }
    });
  }

  async createReminder(userId: number, data: any) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    const reminder = this.reminderRepo.create({
      user,
      ...data
    });
    return await this.reminderRepo.save(reminder);
  }

  async updateReminder(userId: number, id: number, data: any) {
    const reminder = await this.reminderRepo.findOne({
      where: { id, user: { id: userId } }
    });
    if (!reminder) throw new Error('Reminder not found');

    Object.assign(reminder, data);
    return await this.reminderRepo.save(reminder);
  }

  async deleteReminder(userId: number, id: number) {
    const reminder = await this.reminderRepo.findOne({
      where: { id, user: { id: userId } }
    });
    if (!reminder) throw new Error('Reminder not found');

    await this.reminderRepo.remove(reminder);
    return { message: 'Reminder deleted successfully' };
  }

  // Admin access
  async getAllReminders() {
    const reminders = await this.reminderRepo.find({
      relations: { user: true },
      order: { reminder_date: 'DESC' }
    });

    // Remove password hashes from relation for safety
    return reminders.map(reminder => {
      if (reminder.user) {
        const { password_hash, ...safeUser } = reminder.user;
        reminder.user = safeUser as User;
      }
      return reminder;
    });
  }
}
