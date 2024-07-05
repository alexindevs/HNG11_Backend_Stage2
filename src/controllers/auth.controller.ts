import { Request, Response } from 'express';
import Joi from 'joi';
import AuthService from '../services/auth.service';

export default class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  private validateRegistration(body: any): Joi.ValidationResult {
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      phone: Joi.string().optional().allow(null),
    });
    return schema.validate(body);
  }

  private validateLogin(body: any): Joi.ValidationResult {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    return schema.validate(body);
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    const { firstName, lastName, email, password, phone } = req.body;

    const { error } = this.validateRegistration(req.body);
    if (error) {
      res.status(422).json({
        errors: error.details.map(err => ({
          field: err.context?.key ?? '',
          message: err.message,
        })),
      });
      return;
    }

    const userExists = await this.authService.checkIfUserExists(email);
    if (userExists) {
      res.status(422).json({
        errors: [
          {
            field: 'email',
            message: 'Email already exists',
          }
        ]
      });
      return;
    }

    try {
      const result = await this.authService.register(firstName, lastName, email, password, phone);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(400).json({
        status: 'Bad request',
        message: 'Registration unsuccessful',
        statusCode: 400,
      });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const { error } = this.validateLogin(req.body);
    if (error) {
      res.status(422).json({
        errors: error.details.map(err => ({
          field: err.context?.key ?? '',
          message: err.message,
        })),
      });
      return;
    }

    try {
      const result = await this.authService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401,
      });
    }
  };
}
