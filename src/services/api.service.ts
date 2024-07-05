import { Organisation } from '@prisma/client';
import { OrganisationRepository } from '../repositories/organisation.repository';
import { UserRepository } from '../repositories/user.repository';

export default class ApiService {
  private userRepository: UserRepository;
  private organisationRepository: OrganisationRepository;

  constructor(userRepository: UserRepository, organisationRepository: OrganisationRepository) {
    this.userRepository = userRepository;
    this.organisationRepository = organisationRepository;
  }

  async hasAccessToOrganisation(userId: string, organisationId: string): Promise<boolean> {
    const userOrganisations = await this.organisationRepository.getOrganisationsByUserId(userId);
    return userOrganisations.some(org => org.orgId === organisationId);
  }

  async hasAccessToUserInfo(userId: string, requestedUserId: string): Promise<{ hasAccess: boolean, sharedOrganisation?: Organisation }> {
    const userOrganisations = await this.organisationRepository.getOrganisationsByUserId(userId);
    const requestedUserOrgs = await this.organisationRepository.getOrganisationsByUserId(requestedUserId);

    for (const org of userOrganisations) {
      const sharedOrganisation = requestedUserOrgs.find(reqOrg => reqOrg.orgId === org.orgId);
      if (sharedOrganisation) {
        return { hasAccess: true, sharedOrganisation };
      }
    }

    return {hasAccess:false};
  }

  async getUserData(userId: string, requestedUserId: string): Promise<SuccessResponse | ErrorResponse> {
    try {
      const requestedUser = await this.userRepository.findUserById(requestedUserId);

      if (!requestedUser) {
        throw new Error('User not found');
      }

      if (requestedUser.userId !== userId) {
        const hasAccess = (await this.hasAccessToUserInfo(userId, requestedUserId)).hasAccess;
        if (!hasAccess) {
          throw new Error('User does not have access to the requested user');
        }
      }

      const userData = {
        userId: requestedUser.userId,
        firstName: requestedUser.firstName,
        lastName: requestedUser.lastName,
        email: requestedUser.email,
        phone: requestedUser.phone || '',
      };

      return {
        status: 'success',
        message: 'User data retrieved successfully',
        data: userData,
      };
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return {
        status: 'error',
        message: 'Error retrieving user data',
        statusCode: 500,
      }
    }
  }

  async getUserOrganisations(userId: string): Promise<SuccessResponse | ErrorResponse> {
    try {
      const organisations = await this.organisationRepository.getOrganisationsByUserId(userId);

      const organisationsData = organisations.map(org => ({
        orgId: org.orgId,
        name: org.name,
        description: org.description || '',
      }));

      return {
        status: 'success',
        message: 'Organisations retrieved successfully',
        data: {
          organisations: organisationsData,
        },
      };
    } catch (error) {
      console.error('Error retrieving organisations:', error);
      return {
        status: 'error',
        message: 'Error retrieving organisations',
        statusCode: 500,
      }
    }
  }

  async getOrganisationData(userId: string, orgId: string): Promise<SuccessResponse | ErrorResponse> {
    try {
      const organisation = await this.organisationRepository.getOrganisationById(orgId);

      if (!organisation) {
        throw new Error('Organisation not found');
      }

      if (!await this.hasAccessToOrganisation(userId, orgId)) {
        throw new Error('User does not have access to the requested organisation');
      }

      const organisationData = {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description || '',
      };

      return {
        status: 'success',
        message: 'Organisation data retrieved successfully',
        data: organisationData,
      };
    } catch (error: any) {
      console.error('Error retrieving organisation data:', error);
      return {
        status: 'error',
        message: error.message || 'Error retrieving organisation data',
        statusCode: 500,
      }
    }
  }

  async createOrganisation(name: string, userId: string, description: string | null): Promise<SuccessResponse | ErrorResponse> {
    try {
      if (!name) {
        throw new Error('Organisation name is required');
      }

      const organisation = await this.organisationRepository.createOrganisation(name, userId, description);

      const organisationData = {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description || '',
      };

      return {
        status: 'success',
        message: 'Organisation created successfully',
        data: organisationData,
      };
    } catch (error) {
      console.error('Error creating organisation:', error);
      return {
        status: 'error',
        message: 'Error creating organisation',
        statusCode: 500,
      }
    }
  }

  async getOrganisationUsers(userId: string, orgId: string): Promise<SuccessResponse | ErrorResponse> {
    try {
      const organisation = await this.organisationRepository.getOrganisationWithUsers(orgId);

      if (!organisation) {
        throw new Error('Organisation not found');
      }

      if (!await this.hasAccessToOrganisation(userId, orgId)) {
        throw new Error('User does not have access to the requested organisation');
      }

      return {
        status: 'success',
        message: 'Organisation users retrieved successfully',
        data: organisation,
      }
    } catch (error) {
      console.error('Error retrieving organisation users:', error);
      return {
        status: 'error',
        message: 'Error retrieving organisation users',
        statusCode: 500,
      }
    }
  }

  async addUserToOrganisation(userId: string, orgId: string, requestedUserId: string): Promise<any> {
    try {
      const hasAccess = await this.hasAccessToOrganisation(userId, orgId);
      if (!hasAccess) {
        throw new Error('User does not have access to the requested Organisation');
      }
      await this.organisationRepository.addUserToOrganisation(orgId, requestedUserId);

      return {
        status: 'success',
        message: 'User added to organisation successfully',
      };
    } catch (error) {
      console.error('Error adding user to organisation:', error);
      throw error;
    }
  }
}
