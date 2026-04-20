const request = require("supertest");
const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/userController");

const User = require("../models/userModel");

jest.mock("../models/userModel");

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword"),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "fakeToken"),
}));

const app = express();
app.use(express.json());

app.post("/register", registerUser);
app.post("/login", loginUser);

describe("AUTH CONTROLLER TESTS", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /register", () => {

    it("should register user successfully", async () => {

      User.findOne.mockResolvedValue(null);

      User.create.mockResolvedValue({
        _id: "user123",
        name: "John",
        email: "john@test.com",
        role: "client",
      });

      const res = await request(app)
        .post("/register")
        .send({
          name: "John",
          email: "john@test.com",
          password: "123456",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.email).toBe("john@test.com");
      expect(res.body.token).toBeDefined();
    });

    it("should return 400 if user exists", async () => {

      User.findOne.mockResolvedValue({
        email: "john@test.com",
      });

      const res = await request(app)
        .post("/register")
        .send({
          name: "John",
          email: "john@test.com",
          password: "123456",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("User already exists");
    });

  });


  describe("POST /login", () => {

    it("should login successfully", async () => {

      const mockUser = {
        _id: "user123",
        name: "John",
        email: "john@test.com",
        role: "client",
        password: "hashedPassword",
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .post("/login")
        .send({
          email: "john@test.com",
          password: "123456",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe("john@test.com");
      expect(res.body.token).toBeDefined();
    });

    it("should fail login with wrong credentials", async () => {

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post("/login")
        .send({
          email: "wrong@test.com",
          password: "wrongpass",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

  });

});