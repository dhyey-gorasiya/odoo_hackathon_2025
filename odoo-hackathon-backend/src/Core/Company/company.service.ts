import {
  Injectable,
  Logger,
  HttpStatus,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CompanyDto } from './company.dto';
import fb from '../../firebase/firebase';
import { COLLECTION, comparePassword, hashPassword, message } from 'src/common/constraints';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  async addItem(dto: CompanyDto) {
    try {
      const db = fb.getFirestore();
      dto.password = hashPassword(dto.password);
      const payload = {
        ...JSON.parse(JSON.stringify(dto)),
        createdAt: new Date(),
      };

      const companyRef = await db.collection(COLLECTION.COMPANY).add(payload);

      return {
        success: true,
        status: HttpStatus.OK,
        message: message.success.company_added,
        data: { id: companyRef.id },
      };
    } catch (error) {
      this.logger.error(error.message || error);
      throw new InternalServerErrorException(
        message.error.something_went_wrong,
      );
    }
  }

  async login(email: string, password: string) {
    try {
      const db = fb.getFirestore();

      const snapshot = await db
        .collection(COLLECTION.COMPANY)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        throw new NotFoundException(message.error.company_not_found);
      }

      const doc = snapshot.docs[0];
      const company = doc.data();

      const isMatch = await comparePassword(password, company.password);
      if (!isMatch) {
        throw new UnauthorizedException(message.error.invalid_credentials);
      }

      // normally you’d issue JWT here
      return {
        success: true,
        status: HttpStatus.OK,
        message: message.success.login_success,
        data: {
          id: doc.id,
          name: company.name,
          email: company.email,
        },
      };
    } catch (error) {
      this.logger.error(error.message || error);
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(message.error.something_went_wrong);
    }
  }

  async getAllItems() {
    try {
      const db = fb.getFirestore();
      const snapshot = await db.collection(COLLECTION.COMPANY).get();
      const companies = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        status: HttpStatus.OK,
        data: companies,
      };
    } catch (error) {
      this.logger.error(error.message || error);
      throw new InternalServerErrorException(
        message.error.something_went_wrong,
      );
    }
  }

  async getItemById(id: string) {
    try {
      const db = fb.getFirestore();
      const doc = await db.collection(COLLECTION.COMPANY).doc(id).get();

      if (!doc.exists)
        throw new NotFoundException(message.error.company_not_found);

      return {
        success: true,
        status: HttpStatus.OK,
        data: { id: doc.id, ...doc.data() },
      };
    } catch (error) {
      this.logger.error(error.message || error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        message.error.something_went_wrong,
      );
    }
  }

  async updateItem(id: string, dto: CompanyDto) {
    try {
      const db = fb.getFirestore();
      const companyRef = db.collection(COLLECTION.COMPANY).doc(id);
      const doc = await companyRef.get();

      if (!doc.exists)
        throw new NotFoundException(message.error.company_not_found);

      const updateData: Partial<CompanyDto> = { ...dto };

      await companyRef.update({ ...updateData, updatedAt: new Date() });

      return {
        success: true,
        status: HttpStatus.OK,
        message: message.success.company_updated,
      };
    } catch (error) {
      this.logger.error(error.message || error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        message.error.something_went_wrong,
      );
    }
  }

  async deleteItem(id: string) {
    try {
      const db = fb.getFirestore();
      const companyRef = db.collection(COLLECTION.COMPANY).doc(id);
      const doc = await companyRef.get();

      if (!doc.exists)
        throw new NotFoundException(message.error.company_not_found);

      await companyRef.delete();
      return {
        success: true,
        status: HttpStatus.OK,
        message: message.success.company_deleted,
      };
    } catch (error) {
      this.logger.error(error.message || error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        message.error.something_went_wrong,
      );
    }
  }
}
