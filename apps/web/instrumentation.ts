/**
 * This file is used to register monitoring instrumentation
 * for your Next.js application.
 */
import { type Instrumentation } from 'next';

/**
 * @name onRequestError
 * @description This function is called when an error occurs during the request lifecycle.
 * It is used to capture the error and send it to the monitoring service.
 * @param err
 */
export const onRequestError: Instrumentation.onRequestError = (err) => {
  console.error(`Server Side Error:`, err);
};
