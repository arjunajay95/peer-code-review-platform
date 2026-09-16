const CLERK_API = "https://api.clerk.com/v1";
function authHeader() {
  return { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`, "Content-Type": "application/json" };
}
export interface TestClerkUser { clerkId: string; }
export async function createTestClerkUser(emailPrefix: string): Promise<TestClerkUser> {
  const email = `${emailPrefix}-${Date.now()}@codecritic-test.dev`;
  const username = `t${Date.now().toString().slice(-6)}`;
  const userRes = await fetch(`${CLERK_API}/users`, { method: "POST", headers: authHeader(),
    body: JSON.stringify({ email_address: [email], password: "TestPassword123456!", username }) });
  if (!userRes.ok) throw new Error(`createUser failed: ${await userRes.text()}`);
  const { id: clerkId } = await userRes.json() as { id: string };
  return { clerkId };
}
export async function deleteTestClerkUser(clerkId: string): Promise<void> {
  await fetch(`${CLERK_API}/users/${clerkId}`, { method: "DELETE", headers: authHeader() });
}
