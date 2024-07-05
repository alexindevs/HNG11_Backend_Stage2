import { Request, Response } from 'express';
import Joi from 'joi';
import ApiService from '../services/api.service';
import { IRequest } from '../interfaces/request.interface';

export default class ApiController {
  private apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  private validateUserIdParam(params: any): Joi.ValidationResult {
    const schema = Joi.object({
      id: Joi.string().required(),
    });
    return schema.validate(params);
  }

  private validateOrgIdParam(params: any): Joi.ValidationResult {
    const schema = Joi.object({
      orgId: Joi.string().required(),
    });
    return schema.validate(params);
  }

  private validateCreateOrganisationBody(body: any): Joi.ValidationResult {
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().allow('').optional(),
    });
    return schema.validate(body);
  }

  private validateAddUserToOrganisationBody(body: any): Joi.ValidationResult {
    const schema = Joi.object({
      userId: Joi.string().required(),
    });
    return schema.validate(body);
  }

  public getUserData = async (req: IRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { userId } = req.user;

    const { error: paramError } = this.validateUserIdParam(req.params);
    if (paramError) {
      res.status(422).json({
        errors: paramError.details.map(err => ({
          field: err.context?.key ?? '',
          message: err.message,
        })),
      });
      return;
    }

    try {
      const result = await this.apiService.getUserData(userId, id);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error retrieving user data',
        statusCode: 500,
      });
    }
  };

  public getUserOrganisations = async (req: IRequest, res: Response): Promise<void> => {
    const { userId } = req.user;

    try {
      const result = await this.apiService.getUserOrganisations(userId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error retrieving user organisations:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error retrieving user organisations',
        statusCode: 500,
      });
    }
  };

  public getOrganisationUsers = async (req: IRequest, res: Response): Promise<void> => {
    const { orgId } = req.params;
    const { userId } = req.user;

    const { error: paramError } = this.validateOrgIdParam(req.params);
    if (paramError) {
      res.status(422).json({
        errors: paramError.details.map(err => ({
          field: err.context?.key ?? '',
          message: err.message,
        })),
      });
      return;
    }

    try {
      const result = await this.apiService.getOrganisationUsers(userId, orgId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error retrieving organisation users:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error retrieving organisation users',
        statusCode: 500,
      });
    }
  };

  public getOrganisationData = async (req: IRequest, res: Response): Promise<void> => {
    const { orgId } = req.params;
    const { userId } = req.user;

    const { error: paramError } = this.validateOrgIdParam(req.params);
    if (paramError) {
      res.status(422).json({
        errors: paramError.details.map(err => ({
          field: err.context?.key ?? '',
          message: err.message,
        })),
      });
      return;
    }

    try {
      const result = await this.apiService.getOrganisationData(userId, orgId);
      if (result.status === 'error') {
        res.status(401).json(result);
        return;
      }
      res.status(200).json(result);
    } catch (error) {
      console.error('Error retrieving organisation data:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error retrieving organisation data',
        statusCode: 500,
      });
    }
  };

  public createOrganisation = async (req: IRequest, res: Response): Promise<void> => {
    const { name, description } = req.body;
    const { userId } = req.user;

    const { error: bodyError } = this.validateCreateOrganisationBody(req.body);
    if (bodyError) {
      res.status(422).json({
        errors: bodyError.details.map(err => ({
          field: err.context?.key ?? '',
          message: err.message,
        })),
      });
      return;
    }

    try {
      const result = await this.apiService.createOrganisation(name, userId, description);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating organisation:', error);
      res.status(400).json({
        status: 'Bad Request',
        message: 'Client error',
        statusCode: 400,
      });
    }
  };

  // Add user to organisation endpoint
  public addUserToOrganisation = async (req: IRequest, res: Response): Promise<void> => {
    const { orgId } = req.params;
    const { userId } = req.body;
    const id = req.user.userId;

    // Validate add user to organisation request body
    const { error: bodyError } = this.validateAddUserToOrganisationBody(req.body);
    if (bodyError) {
      res.status(422).json({
        errors: bodyError.details.map(err => ({
          field: err.context?.key ?? '',
          message: err.message,
        })),
      });
      return;
    }

    try {
      const result = await this.apiService.addUserToOrganisation(id, orgId, userId);
      res.status(200).json(result);
    } catch (error:any) {
      console.error('Error adding user to organisation:', error);
      res.status(401).json({
        status: 'error',
        message: error.message,
        statusCode: 401,
      });
    }
  };
}
