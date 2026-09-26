import serverless from 'serverless-http';
import { createApiApp } from '../../server/apiApp';

const app = createApiApp();
export const handler = serverless(app);
