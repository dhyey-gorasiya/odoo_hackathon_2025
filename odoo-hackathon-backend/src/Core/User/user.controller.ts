import { BadRequestException, Body, Controller, Get, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './user.dto';
import { UserAuthDto } from './user.auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { CompanyModule } from '../Company/company.module';
import { CompanyDto } from '../Company/company.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: AuthService,
    private otpService: OtpService, private authService: AuthService
  ) { }

  @Post('add')
  async registerUser(@Res() res, @Body() userProfile: CreateUserDto) {
    console.log('Received add user request for user!');
    const result = await this.userService.registerUser(userProfile);
    return res.status(result.status).send(result);
  }

    @Post('company/add')
  async registerCompany(@Res() res, @Body() userProfile: CompanyDto) {
    console.log('Received add user request for user!');
    const result = await this.userService.registerCompany(userProfile);
    return res.status(result.status).send(result);
  }

  @Post('login')
  async loginUser(@Res() res, @Body() loginDto: UserAuthDto) {
    console.log("Login dto : ", loginDto)
    const result = await this.userService.loginUser(loginDto);
    return res.status(result.status).send(result);
  }

  @Post('send-otp')
  async sendOtp(@Res() res, @Body('useremail') useremail: string) {
    if (!useremail) throw new BadRequestException('useremail required');
    const result = await this.otpService.sendOtp(useremail);
    return res.status(result.status).send(result);

  }

  @UseGuards(AuthGuard('jwt'))
  @Post('resetPassword')
  async resetPassword(@Res() res, @Body() loginDto: UserAuthDto, @Req() req) {
    const result = await this.userService.resetPassword(loginDto, req.user?.id);
    return res.status(result.status).send(result);
  }

  @Post('verify-otp')
  async verifyOtpAndRegister(@Body() body: { useremail: string; otp: string } & CreateUserDto) {
    const { useremail, otp, ...userData } = body;
    const ok = await this.otpService.verifyOtp(useremail, otp);
    if (!ok) return { success: false, message: 'Invalid or expired OTP' };
    // now create user with your existing service
    return this.authService.registerUser(userData as CreateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('update')
  async updateUser(@Req() req, @Res() res, @Body() userProfile: Partial<CreateUserDto>) {
    const result = await this.userService.updateUserProfile(userProfile, req.user?.id);
    return res.status(result.status).send(result);
  }

}
