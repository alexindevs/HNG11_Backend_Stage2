// tests/auth.spec.ts

import request from 'supertest';
import app from '../src/server';

describe('POST /auth/register', () => {
  it('should register user successfully with default organisation', async () => {
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wahala.com',
      password: 'password123',
      phone: '1234567890',
    };

    const response = await request(app)
      .post('/auth/register')
      .send(newUser)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Registration successful');
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user.firstName).toBe(newUser.firstName);
    expect(response.body.data.user.lastName).toBe(newUser.lastName);
    expect(response.body.data.user.email).toBe(newUser.email);
  }, 60000);

  it('should fail if required fields are missing', async () => {
    const incompleteUser = {
      lastName: 'Doe',
      email: 'john.doe@gmail.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/auth/register')
      .send(incompleteUser)
      .expect(422);

    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].field).toBe('firstName');
  });

  it('should fail if there is a duplicate email', async () => {
    const existingUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@question.com',
      password: 'password123',
      phone: '1234567890',
    };

    await request(app)
      .post('/auth/register')
      .send(existingUser)
      .expect(201);

    const response = await request(app)
      .post('/auth/register')
      .send(existingUser)
      .expect(422);
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].message).toBe('Email already exists');
  }, 30000);

  it('should login user successfully with correct credentials', async () => {
    const credentials = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/auth/login')
      .send(credentials)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Login successful');
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user.email).toBe(credentials.email);
  });

  it('should fail to login with incorrect credentials', async () => {
    const credentials = {
      email: 'john.doe@example.com',
      password: 'wrongpassword',
    };

    const response = await request(app)
      .post('/auth/login')
      .send(credentials)
      .expect(401);

    expect(response.body.status).toBe('Bad request');
    expect(response.body.message).toBe('Authentication failed');
  });
});
