import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const TEST_EMAIL = "test@degrees-of-bacon.local";
const TEST_PASSWORD = "testpassword123";

setup("create and sign in test user", async ({ page }) => {
  // Use admin API to create test user (if not exists)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Check if user exists, create if not
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = users?.users?.find((u) => u.email === TEST_EMAIL);

  if (!existingUser) {
    await supabaseAdmin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
  }

  // Sign in via the browser
  await page.goto("/auth/signin");
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for redirect to home page
  await page.waitForURL("/", { timeout: 10000 });

  // Save auth state
  await page.context().storageState({ path: "e2e/.auth/user.json" });
});
