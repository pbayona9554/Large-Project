// tests/auth.test.js
jest.setTimeout(20000); // 20s max per test
process.env.JWT_SECRET = "testsecret";

const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

// --------------------
// Mock SendGrid
// --------------------
jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue(true),
}));

// --------------------
// Mock bcrypt
// --------------------
jest.mock("bcryptjs", () => ({
  hash: jest.fn(async (pw) => "hashed-" + pw),
  compare: jest.fn(async (pw, hash) => hash === "hashed-" + pw),
}));

// --------------------
// Mock protect middleware
// --------------------
jest.mock("../src/middleware/authMiddleware", () => ({
  protect: (req, res, next) => {
    req.user = { _id: 1, email: "test@example.com", role: "member" };
    next();
  },
}));

// --------------------
// Mock getDB
// --------------------
const mockUsers = [];
jest.mock("../src/config/db", () => ({
  getDB: () => ({
    collection: (name) => ({
      findOne: async (query) => mockUsers.find(u => u.email === query.email),
      insertOne: async (user) => {
        user._id = mockUsers.length + 1;
        mockUsers.push(user);
        return { insertedId: user._id };
      },
      updateOne: async (filter, update) => {
        const user = mockUsers.find(u => u.email === filter.email);
        if (!user) return;
        if (update.$set) Object.assign(user, update.$set);
        if (update.$unset) {
          for (const key of Object.keys(update.$unset)) delete user[key];
        }
      },
    }),
  }),
}));

// --------------------
// Import routes and setup app
// --------------------
const authRoutes = require("../src/routes/authRoutes");
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

// --------------------
// Helper: generate JWT
// --------------------
const generateToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || "testsecret", { expiresIn: "1h" });

// --------------------
// Setup test user before tests
// --------------------
beforeAll(() => {
  mockUsers.length = 0; // reset
  mockUsers.push({
    _id: 1,
    name: "Test User",
    email: "test@example.com",
    password: "hashed-123456",
    role: "member",
    verification: false,
    clubsjoined: [],
    rsvps: [],
  });
});

// --------------------
// Tests
// --------------------
describe("Auth API (mocked DB + email + bcrypt)", () => {
  const testEmail = "newuser@example.com";
  const testPassword = "123456";

  it("should sign up a new user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "New User", email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
  });

  it("should login an existing user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("should fetch current user when authenticated", async () => {
    const user = mockUsers[0];
    const token = generateToken(user);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("should verify email correctly", async () => {
    const user = mockUsers[0];
    user.verificationCode = "123456";

    const res = await request(app)
      .post("/api/auth/verify")
      .send({ email: "test@example.com", code: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Email verified successfully");
    expect(user.verification).toBe(true);
    expect(user.verificationCode).toBeUndefined();
  });

  it("should handle forgot password and reset password", async () => {
    const resForgot = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "test@example.com" });

    expect(resForgot.status).toBe(200);
    expect(resForgot.body.message).toBe("Reset code sent to your email");

    const user = mockUsers[0];
    const code = user.resetCode;

    const resReset = await request(app)
      .post("/api/auth/reset-password")
      .send({ email: "test@example.com", code, newPassword: "newpass123" });

    expect(resReset.status).toBe(200);
    expect(resReset.body.message).toBe("Password reset successful");
  });
});
