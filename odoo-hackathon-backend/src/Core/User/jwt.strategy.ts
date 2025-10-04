import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JWT_SECRET } from "src/common/utils";
import { JwtPayload } from "./interface/jwt-payload.interface";
import { AuthService } from "./auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private readonly authService : AuthService){
        super({
            jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreElements : false,
            secretOrKey : JWT_SECRET,
        })
    }

    async validate(payload : JwtPayload){        
        const user = await this.authService.validateUser(payload.userphone)
        if(!user){
            throw new UnauthorizedException();
        }
        return user
    }
}