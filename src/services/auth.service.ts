import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcrypt";
import { AccessTokenService } from "./accesstoken.service";
import { OrganisationRepository } from "../repositories/organisation.repository";

export default class AuthService {
    private userRepository: UserRepository;
    private orgRepository: OrganisationRepository;
    private ATS: AccessTokenService;

    constructor() {
        this.userRepository = new UserRepository();
        this.orgRepository = new OrganisationRepository();
        this.ATS = new AccessTokenService();
    }

    async register(firstName: string, lastName: string, email: string, password: string, phone?: string): Promise<SuccessResponse | ErrorResponse> {
        try {
            const user = await this.userRepository.findUserByEmail(email);
            if (user) {
                throw new Error("User already exists");
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await this.userRepository.createUser({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone: phone || undefined
            });

            await this.orgRepository.createOrganisationForUser(newUser.userId, firstName);
            const accesstoken = this.ATS.generateAccessToken(newUser);
            return {
                status: "success",
                message: "Registration successful",
                data: {
                    accessToken: accesstoken,
                    user: newUser
                }
            };
        } catch (error: any) {
            console.log(error);
            return {
                status: "Bad request",
                message: "Registration unsuccessful",
                statusCode: 400
            }
        }
    }

    async login(email: string, password: string): Promise<SuccessResponse | ErrorResponse> {
        try {
            const user = await this.userRepository.findUserByEmail(email);
            if (!user) {
                throw new Error("User not found");
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid password");
            }
            const accesstoken = this.ATS.generateAccessToken(user);
            return {
                status: "success",
                message: "Login successful",
                data: {
                    accessToken: accesstoken,
                    user
                }
            };
        } catch (error: any) {
            console.log(error);
            throw error;
        }
    }

    async checkIfUserExists(email: string): Promise<boolean> {
        const user = await this.userRepository.findUserByEmail(email);
        return !!user;
    }

}