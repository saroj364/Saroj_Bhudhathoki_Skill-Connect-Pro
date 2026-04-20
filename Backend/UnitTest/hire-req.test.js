const request = require("supertest");
const express = require("express");

// controller + models
const { createJob } = require("../controllers/userController");
const Job = require("../models/Job");
const Chat = require("../models/Chat");
const Message = require("../models/message");

jest.mock("../models/Job");
jest.mock("../models/Chat");
jest.mock("../models/message");

const mockAuth = (req, res, next) => {
  req.user = { id: "client123" };
  next();
};

const app = express();
app.use(express.json());

const ioMock = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

app.set("io", ioMock);

app.post("/api/users/freelancer/create", mockAuth, createJob);

describe("POST /api/users/freelancer/create", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a job successfully", async () => {
    Job.findOne.mockResolvedValue(null);
    const mockJob = {
      _id: "job123",
      save: jest.fn(),
    };
    Job.create.mockResolvedValue(mockJob);
    Chat.findOne.mockResolvedValue(null);
    const mockChat = {
      _id: "chat123",
    };
    Chat.create.mockResolvedValue(mockChat);
    const mockMessage = {
      _id: "msg123",
    };
    Message.create.mockResolvedValue(mockMessage);
    const res = await request(app)
      .post("/api/users/freelancer/create")
      .send({
        freelancerId: "freelancer123",
        title: "Build Website",
        description: "Need React website",
        hours: 10,
        workType: "remote",
        budget: 500
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.jobId).toBe("job123");
    expect(res.body.chatId).toBe("chat123");
    expect(res.body.message).toBeDefined();
  });

  it("should return 400 if job already exists", async () => {

    Job.findOne.mockResolvedValue({
      _id: "existingJob"
    });

    const res = await request(app)
      .post("/api/users/freelancer/create")
      .send({
        freelancerId: "freelancer123",
        title: "Build Website",
        description: "Need React website",
        hours: 10,
        workType: "remote",
        budget: 500
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Job already exists");
  });

  it("should handle server error", async () => {

    Job.findOne.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .post("/api/users/freelancer/create")
      .send({
        freelancerId: "freelancer123",
        title: "Build Website",
        description: "Need React website",
        hours: 10,
        workType: "remote",
        budget: 500
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

});