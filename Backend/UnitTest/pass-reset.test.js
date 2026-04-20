jest.mock("../models/userModel");

const request = require("supertest");
const app = require("../app");
const User = require("../models/userModel");

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  }),
}));

afterEach(() => {
  jest.clearAllMocks();
});



describe("POST /api/users/forgot-password", () => {

  it("should send OTP if user exists", async () => {

    User.findOne.mockResolvedValue({
      email: "test@test.com",
      save: jest.fn().mockResolvedValue(true),
    });

    const res = await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "test@test.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  it("should return 404 if user not found", async () => {

    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "notfound@test.com" });

    expect(res.statusCode).toBe(404);
  });

});


describe("POST /api/users/otp-verify", () => {

  it("should verify correct OTP", async () => {

    const mockUser = {
      email: "test@test.com",
      resetOTP: "123456",
      otpExpire: Date.now() + 5000,
      save: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .post("/api/users/otp-verify")
      .send({ email: "test@test.com", otp: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("OTP verified successfully");
  });

  it("should reject wrong OTP", async () => {

    const mockUser = {
      email: "test@test.com",
      resetOTP: "123456",
      otpExpire: Date.now() + 5000,
      save: jest.fn(),
    };

    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .post("/api/users/otp-verify")
      .send({ email: "test@test.com", otp: "000000" });

    expect(res.statusCode).toBe(400);
  });

  it("should reject expired OTP", async () => {

    const mockUser = {
      email: "test@test.com",
      resetOTP: "123456",
      otpExpire: Date.now() - 10000,
      save: jest.fn(),
    };

    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .post("/api/users/otp-verify")
      .send({ email: "test@test.com", otp: "123456" });

    expect(res.statusCode).toBe(400);
  });

});



describe("POST /api/users/reset-password", () => {

  it("should reset password successfully", async () => {

    const mockUser = {
      email: "test@test.com",
      isOTPVerified: true,
      save: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .post("/api/users/reset-password") 
      .send({
        email: "test@test.com",
        newPassword: "newpass123",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Password updated successfully");
  });


});