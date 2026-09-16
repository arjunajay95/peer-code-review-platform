export function getAuthorToken(): string {
  return process.env.TEST_AUTHOR_CLERK_ID ?? "user_3I5sfapwrxtnFSGZxlCaXTVW4bL";
}

export function getReviewerToken(): string {
  return process.env.TEST_REVIEWER_CLERK_ID ?? "user_3I5sqvJPO8TCUTA8tDcS2zIWJoJ";
}
