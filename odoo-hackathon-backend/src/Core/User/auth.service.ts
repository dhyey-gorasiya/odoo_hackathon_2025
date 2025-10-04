import { BadRequestException, ConflictException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import fb from '../../firebase/firebase';
import { CreateUserDto } from "./user.dto";
import { COLLECTION, comparePassword, hashPassword, message } from "src/common/constraints";
import { UserAuthDto } from "./user.auth.dto";
import { JWT_SECRET } from "src/common/utils";
import * as jwt from 'jsonwebtoken';
import { CompanyModule } from "../Company/company.module";
import { CompanyDto } from "../Company/company.dto";
import { CompanyAuthDto } from "./company_auth.dto.";


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async validateUser(phone: string) {
    try {
      const user = await this.getUserProfileByPhoneNumber(phone);
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async getUserProfileByPhoneNumber(usermobile: string): Promise<CreateUserDto & { id: string }> {
    try {
      const db = fb.getFirestore();
      const snapShot = await db.collection(COLLECTION.Auth).where('userphone', '==', usermobile).get();
      if (snapShot.empty) {
        throw new NotFoundException(message.error.user_not_found);
      }
      return {
        id: snapShot.docs[0].id,
        ...(snapShot.docs[0].data() as CreateUserDto),
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(message.error.something_went_wrong);
    }
  }

  async isUserExists(mobileNumber: string) {
    const db = fb.getFirestore();
    const userSnapshot = await db.collection(COLLECTION.Auth).where('userphone', '==', mobileNumber).get();
    return !userSnapshot.empty;
  }

    async isCompanyExists(email: string) {
    const db = fb.getFirestore();
    const userSnapshot = await db.collection(COLLECTION.Auth).where('wmail', '==', email).get();
    return !userSnapshot.empty;
  }

  async addUserAuth(userAuthDto: UserAuthDto) {
    try {
      const db = fb.getFirestore();
      userAuthDto.password = hashPassword(userAuthDto.password);
      await db.collection(COLLECTION.Auth).add(JSON.parse(JSON.stringify(userAuthDto)));
      return userAuthDto;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(message.error.add_user_auth_failure);
    }
  }

    async addCompanyAuth(userAuthDto: CompanyAuthDto) {
    try {
      const db = fb.getFirestore();
      userAuthDto.password = hashPassword(userAuthDto.password);
      await db.collection(COLLECTION.Company_auth).add(JSON.parse(JSON.stringify(userAuthDto)));
      return userAuthDto;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(message.error.add_user_auth_failure);
    }
  }

  async addUserProfile(userProfile: CreateUserDto) {
    try {
      const db = fb.getFirestore();
      await db.collection(COLLECTION.Profile).add(JSON.parse(JSON.stringify(userProfile)));
      return userProfile;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(message.error.something_went_wrong);
    }
  }

    async addCompanyProfile(userProfile: CompanyDto) {
    try {
      const db = fb.getFirestore();
      await db.collection(COLLECTION.COMPANY).add(JSON.parse(JSON.stringify(userProfile)));
      return userProfile;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(message.error.something_went_wrong);
    }
  }

  generateJWT(payload: CreateUserDto) {
    const tokenPayload = {
      useremail: payload.useremail,
      userphone: payload.userphone,
    };
    return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });
  }
  
    generateJWTCompany(payload: CompanyDto) {
    const tokenPayload = {
      useremail: payload.email,
      userphone: payload.name,
    };
    return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });
  }
  async registerUser(userProfile: CreateUserDto) {
    const isUserExists = await this.isUserExists(userProfile.userphone);
    if (isUserExists) {
      throw new BadRequestException(message.error.user_already_exists);
    }

    await this.addUserAuth({
      userphone: userProfile.userphone,
      password: userProfile.password,
      verified : false
    });

    const { password, ...profileWithoutPassword } = userProfile;
    await this.addUserProfile(profileWithoutPassword as CreateUserDto);

    const token = this.generateJWT(profileWithoutPassword as CreateUserDto);
    return { success: true, status: HttpStatus.OK, data: { token, message: message.success.user_registered } };
  }

    async registerCompany(userProfile: CompanyDto) {
    const isUserExists = await this.isCompanyExists(userProfile.email);
    if (isUserExists) {
      throw new BadRequestException(message.error.user_already_exists);
    }

    await this.addCompanyAuth({
      email: userProfile.email,
      password: userProfile.password,
      verified : false
    });

    const { password, ...profileWithoutPassword } = userProfile;
    await this.addCompanyProfile(profileWithoutPassword as CompanyDto);

    const token = this.generateJWTCompany(profileWithoutPassword as CompanyDto);
    return { success: true, status: HttpStatus.OK, data: { token, message: message.success.user_registered } };
  }

  async getUserAuth(userphone: string): Promise<UserAuthDto> {
    const db = fb.getFirestore();
    const snap = await db.collection(COLLECTION.Auth).where('userphone', '==', userphone).get();
    if (snap.empty) throw new NotFoundException(message.error.user_not_found);
    return snap.docs[0].data() as UserAuthDto;
  }

  async validatePassword(password: string, hash: string) {
    return await comparePassword(password, hash);
  }

  async getUserProfileByMobileNumber(userphone: string, userId?: string) {
    const db = fb.getFirestore();
    const snapShot = await db.collection(COLLECTION.Profile).where('userphone', '==', userphone).get();
    if (snapShot.empty) throw new NotFoundException(message.error.user_not_found);
    return { userProfile: snapShot.docs[0].data() as CreateUserDto, id: snapShot.docs[0].id || null };
  }

  async loginUser(loginDto: UserAuthDto) {
    const userAuth = await this.getUserAuth(loginDto.userphone);
    const isPasswordValid = await this.validatePassword(loginDto.password, userAuth.password);

    if (!isPasswordValid) {
      throw new BadRequestException(message.error.invalid_credentials);
    }

    const userProfile = await this.getUserProfileByMobileNumber(loginDto.userphone);

    const token = this.generateJWT(userProfile.userProfile);

    return { success: true, status: HttpStatus.OK, data: { token, userphone: loginDto.userphone, message: message.success.login_successful } };
  }

  async updateUserProfile(userProfileRequest: Partial<CreateUserDto>, userId?: string) {
    const { userProfile, id } = await this.getUserProfileByMobileNumber(userProfileRequest.userphone);
    if (!userProfile || !id) {
      throw new NotFoundException(message.error.user_not_found);
    }
    const db = fb.getFirestore();
    await db.collection(COLLECTION.Profile).doc(id).update(JSON.parse(JSON.stringify(userProfile)));
    return { success: true, status: HttpStatus.OK, data: { message: message.success.profile_updated } };
  }

  
  async resetPassword(loginDto: UserAuthDto , userId?: string) {
    const userAuth = await this.getUserAuth(loginDto.userphone);
    const isDuplicate = await this.validatePassword(loginDto.password, userAuth.password);
    if (isDuplicate) {
      throw new ConflictException('Same password not allowed');
    }

    await this.updateUserAuth({
      userphone: loginDto.userphone,
      password: loginDto.password,
    });

    // const token = this.generateJWT(userAuth);
    return { success: true, status: HttpStatus.OK, data: { message : "Reset password is sucesfully completed" } };
  }

  async updateUserAuth(userAuthDto: Partial<UserAuthDto>) {
  try {
    const db = fb.getFirestore();
    const usersRef = db.collection(COLLECTION.Auth);

    // find user by phone
    const snapshot = await usersRef
      .where('userphone', '==', userAuthDto.userphone)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException('User not found');
    }

    const userDoc = snapshot.docs[0].ref;

    // hash password before saving (recommended)
    const hashedPassword = hashPassword(userAuthDto.password);

    await userDoc.update({
      password: hashedPassword,
      updated_at: new Date(),
    });

    return {
      success: true,
      status: HttpStatus.OK,
      data: { message: 'User password updated successfully' },
    };
  } catch (error) {
    this.logger.error(error.message || error);
    throw new InternalServerErrorException(
      'Something went wrong while updating user auth',
    );
  }
}


}