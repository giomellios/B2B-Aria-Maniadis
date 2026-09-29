export const loggerCtx = 'CustomerApprovalPlugin';

/**
 * Returned to the storefront (as `InvalidCredentialsError.authenticationError`, or as the
 * GraphQL error message) when a customer who has not been approved by an admin tries to log in.
 */
export const ACCOUNT_PENDING_APPROVAL = 'ACCOUNT_PENDING_APPROVAL';
