import { AppDataSource } from '../config/data-source';
import { SharedAccess } from '../entities/SharedAccess';
import { User } from '../entities/User';

export class SharedAccessAuditService {
  private sharedAccessRepo = AppDataSource.getRepository(SharedAccess);

  async getAllSharedAccesses() {
    const accesses = await this.sharedAccessRepo.find({
      relations: { owner: true, guest: true },
      order: { created_at: 'DESC' }
    });

    // Remove password hashes from users for safety
    return accesses.map(access => {
      if (access.owner) {
        const { password_hash, ...safeOwner } = access.owner;
        access.owner = safeOwner as User;
      }
      if (access.guest) {
        const { password_hash, ...safeGuest } = access.guest;
        access.guest = safeGuest as User;
      }
      return access;
    });
  }
}
