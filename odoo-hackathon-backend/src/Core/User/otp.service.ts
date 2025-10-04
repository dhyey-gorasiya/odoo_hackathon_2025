// src/auth/otp.service.ts
import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import fb from 'src/firebase/firebase'; // your firebase helper
import { MailService } from '../Mail/mail.service';
import { message } from 'src/common/constraints';

@Injectable()
export class OtpService {
      private readonly logger = new Logger(OtpService.name);
    
  constructor(private mailService: MailService) {}

  private db() {
    return fb.getFirestore();
  }

  async sendOtp(email: string) {
    try{
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.db().collection('otps').doc(email).set({
        otp,
        expiresAt,
        });
        this.logger.log(`OTP sent to ${email}`);

        // await this.mailService.sendOtpEmail(email, otp, 5);

        await this.mailService.sendOtpEmail(email, otp, 5, { template: 'modern', appName: 'Phiomyst Healthcare' });


        return { success: true, status: HttpStatus.OK, data: message.success.opt_send + " " }; 
    }catch(error){
        this.logger.error(`Failed to send OTP to ${email}`, error);
        throw new InternalServerErrorException(message.error.something_went_wrong);
    }

    
  }

//   async verifyOtp(email: string, otp: string) {
//     const doc = await this.db().collection('otps').doc(email).get();
//     if (!doc.exists) return false;
//     const data = doc.data() as any;
//     const expiresAt = data.expiresAt instanceof Date ? data.expiresAt : new Date(data.expiresAt);
//     console.log("OPT IS : "+ data.otp +" || " + "User OTP is : " + otp);
    
//     if (data.otp != otp) return false;
//     console.log("OPT IS : "+ data.otp +" || " + "User OTP is : " + otp);

//     if (expiresAt.getTime() < Date.now()) {
//     console.log("OPT IS : "+ data.otp +" || " + "User OTP is : " + otp);

//       await this.db().collection('otps').doc(email).delete();
//       return false;
//     }
//     // await this.db().collection('otps').doc(email).delete(); // cleanup
//     return true;
//   }

async verifyOtp(email: string, otp: string) {
  if (!email || !otp) {
    throw new BadRequestException('Email and OTP are required');
  }

  const doc = await this.db().collection('otps').doc(email).get();
  if (!doc.exists) return false;

  const data = doc.data() as any;
  if (!data?.otp || !data?.expiresAt) return false;

  const expiresAt =
    data.expiresAt instanceof Date ? data.expiresAt : new Date(data.expiresAt);

  console.log(`OPT IS : ${data.otp} || User OTP is : ${otp}`);

  if (data.otp !== otp) return false;

  if (expiresAt.getTime() < Date.now()) {
    await this.db().collection('otps').doc(email).delete();
    return false;
  }

  // optionally cleanup after successful verification
  // await this.db().collection('otps').doc(email).delete();

  return true;
}

}
