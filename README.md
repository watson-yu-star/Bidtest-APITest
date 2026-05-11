# Bidtest-APITest

The API test is based on playwright API testing.

## 1. Prerequisites

You need the following installed locally. Exact versions are suggestions – anything in the same major line should be fine.


| Tool     | Recommended version | Check command        |
|----------|---------------------|----------------------|
| Node.js  | 18.x or 20.x LTS    | `node --version`     |
| npm      | 9.x or 10.x         | `npm --version`      |
| Git      | any modern version  | `git --version`      |

## 2. Getting the code

```bash
# Clone or unzip the repo, then:
cd APITest

# Install the dependencies for the api test project
npm install
```

## 3. Running the test

```bash
npm run test
```

You should see:

> apitest@1.0.0 test
> npx playwright test
Please wait for a while , then it starts running
If run too many times, maybe it fails because the product is out of stock. Then need to restart the backend service.

## 4. Checking the test report

```bash
npm run test:report
```

