import { PrismaClient, Organisation, UserOrganisation } from '@prisma/client';

const prisma = new PrismaClient();

export class OrganisationRepository {
  
  // Function to create an organisation for a user
  async createOrganisationForUser(userId: string, firstName: string): Promise<Organisation> {
    const organisationName = `${firstName}'s Organisation`;
    return prisma.organisation.create({
      data: {
        name: organisationName,
        users: {
          create: { userId: userId },
        },
      },
    });
  }

  async getOrganisationWithUsers(orgId: string): Promise<{
    orgId: string;
    name: string;
    description: string | null;
    users: {
      userId: string;
      firstName: string;
      lastName: string;
      email: string;
    }[];
  } | null> {
    const organisation = await prisma.organisation.findUnique({
      where: { orgId },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!organisation) {
      return null;
    }

    return {
      orgId: organisation.orgId,
      name: organisation.name,
      description: organisation.description,
      users: organisation.users.map(userOrg => ({
        userId: userOrg.user.userId,
        firstName: userOrg.user.firstName,
        lastName: userOrg.user.lastName,
        email: userOrg.user.email,
      })),
    };
  }

  // Function to create a standalone organisation
  async createOrganisation(organisationName: string, userId: string, description: string | null = null): Promise<Organisation> {
    return prisma.organisation.create({
      data: {
        name: organisationName,
        description: description,
        users: {
          create: { userId: userId },
        },
      },
    });
  }

  // Function to add a user to an existing organisation
  async addUserToOrganisation(orgId: string, userId: string): Promise<UserOrganisation> {
    return prisma.userOrganisation.create({
      data: {
        organisationId: orgId,
        userId: userId,
      },
    });
  }

  // Function to fetch organisations associated with a user
  async getOrganisationsByUserId(userId: string): Promise<Organisation[]> {
    return prisma.organisation.findMany({
      where: {
        users: {
          some: {
            userId: userId,
          },
        },
      },
    });
  }

  // Function to fetch an organisation by its ID
  async getOrganisationById(orgId: string): Promise<Organisation | null> {
    return prisma.organisation.findUnique({
      where: {
        orgId: orgId,
      },
    });
  }

  // Function to update an organisation's details
  async updateOrganisation(orgId: string, updateData: Partial<Organisation>): Promise<Organisation> {
    return prisma.organisation.update({
      where: {
        orgId: orgId,
      },
      data: updateData,
    });
  }

  // Function to delete an organisation
  async deleteOrganisation(orgId: string): Promise<Organisation> {
    return prisma.organisation.delete({
      where: {
        orgId: orgId,
      },
    });
  }
}
