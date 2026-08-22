import {test as base, request} from '@playwright/test';
import {users} from '../test-data/users.json';

type MyWorkerFixtures = {
  authToken: string;
};

export const test = base.extend<{},MyWorkerFixtures>({
 

  authToken:[async({}, use) => {
      console.log('Worker started: Generating token via API request...');

    // 1. Create an isolated API request context
    const apiRequest = await request.newContext({
      baseURL:  'http://localhost:4000',
    });
    
    const parallelIndex = test.info().parallelIndex;
    const user = users[parallelIndex % users.length];
    // 2. Execute the POST request to fetch your authentication token
    const response = await apiRequest.post('/auth/login', {
      data: {
        email: user.email,
        password: user.password
      },
      headers: {
        'Accept': 'application/json',
      }
    });

    // 3. Extract the token from the response
    if (!response.ok()) {
      throw new Error(`Failed to generate auth token. Status: ${response.status()}`);
    }

    const responseBody = await response.json();
    const authToken = responseBody.token;

    if (!authToken) {
      throw new Error('Token not found in authentication response');
    }

    console.log('Auth token generated successfully');

    // 4. Provide the token to all tests in this worker
    await use(authToken);

    // 5. Cleanup: dispose of the API request context
    await apiRequest.dispose();
  }, {scope: 'worker'}]
});

export { expect } from '@playwright/test';