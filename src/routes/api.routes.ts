import { Request, Response, NextFunction, Router } from 'express';
import ApiController from '../controllers/api.controller';
import ApiService from '../services/api.service';
import { UserRepository } from '../repositories/user.repository';
import { OrganisationRepository } from '../repositories/organisation.repository';
import { IRequest } from '../interfaces/request.interface';
import { AccessTokenService } from '../services/accesstoken.service';

const router = Router();

const userRepository = new UserRepository();
const organisationRepository = new OrganisationRepository();
const apiService = new ApiService(userRepository, organisationRepository);
const apiController = new ApiController(apiService);
const ATS = new AccessTokenService();

// Middleware to extract and verify user authentication from token
const authenticateUser = (req: IRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({
      status: 'error',
      message: 'Unauthorized',
      statusCode: 401,
    });
    return;
  }

  try {
    const userId = ATS.verifyAccessToken(token);
    if (!userId.isValid) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
        statusCode: 401,
      });
      return;
    }
    req.user = userId.payload;
  } catch (error) {
    console.error('Error verifying access token:', error);
    res.status(401).json({
      status: 'error',
      message: 'Unauthorized',
      statusCode: 401,
    });
    return;
  }
  next();
};

// Routes with simplified definitions
router.get('/users/:id', authenticateUser, apiController.getUserData);
router.get('/organisations', authenticateUser, apiController.getUserOrganisations);
router.get('/organisations/:orgId/users', authenticateUser, apiController.getOrganisationUsers);
router.get('/organisations/:orgId', authenticateUser, apiController.getOrganisationData);
router.post('/organisations', authenticateUser, apiController.createOrganisation);
router.post('/organisations/:orgId/users', authenticateUser, apiController.addUserToOrganisation);

export default router;
