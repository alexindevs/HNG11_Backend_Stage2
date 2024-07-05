import { OrganisationRepository } from '../src/repositories/organisation.repository'; // Adjust path as per your setup
import ApiService from '../src/services/api.service'; // Adjust path as per your setup

// Mock OrganisationRepository
const mockOrganisationRepository: any = {
  async getOrganisationsByUserId(userId: string) {
    // Mock implementation for testing
    return [
      { orgId: 'org1', name: 'Org 1', description: 'Description 1' },
      { orgId: 'org2', name: 'Org 2', description: 'Description 2' },
    ]; // Replace with your test data
  }
};

describe('ApiService - hasAccessToOrganisation', () => {
  let apiService: ApiService;

  beforeEach(() => {
    apiService = new ApiService(mockOrganisationRepository as any, mockOrganisationRepository as any); // Mock other dependencies as needed
  });

  it('should return true if user has access to organisation', async () => {
    const userId = 'user1';
    const organisationId = 'org1';

    const result = await apiService.hasAccessToOrganisation(userId, organisationId);

    expect(result).toBe(true);
  });

  it('should return false if user does not have access to organisation', async () => {
    const userId = 'user1';
    const organisationId = 'org3'; // Non-existent organisation for the user

    const result = await apiService.hasAccessToOrganisation(userId, organisationId);

    expect(result).toBe(false);
  });
});
