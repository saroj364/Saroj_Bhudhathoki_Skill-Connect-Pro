const request = require("supertest");
const express = require("express");

const {
  approveCourse,
  rejectCourse,
  approveUser,
  rejectUser,
} = require("../controllers/adminController");

const Course = require("../models/courseModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");

jest.mock("../models/courseModel");
jest.mock("../models/userModel");
jest.mock("../models/notificationModel");

// fake auth middlewares
const protect = (req, res, next) => {
  req.user = { _id: "admin123" };
  next();
};

const adminOnly = (req, res, next) => next();

const app = express();
app.use(express.json());

// routes
app.put("/courses/approve/:id", protect, adminOnly, approveCourse);
app.delete("/courses/reject/:id", protect, adminOnly, rejectCourse);
app.put("/approve-user/:id", protect, adminOnly, approveUser);
app.delete("/reject-user/:id", protect, adminOnly, rejectUser);

describe("ADMIN ROUTES", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe("PUT /courses/approve/:id", () => {

    it("should approve course", async () => {
      const mockCourse = {
        save: jest.fn(),
        isPublished: false,
      };

      Course.findById.mockResolvedValue(mockCourse);

      const res = await request(app)
        .put("/courses/approve/course123");

      expect(res.statusCode).toBe(200);
      expect(mockCourse.isPublished).toBe(true);
      expect(mockCourse.save).toHaveBeenCalled();
    });

    it("should return 404 if course not found", async () => {
      Course.findById.mockResolvedValue(null);

      const res = await request(app)
        .put("/courses/approve/course123");

      expect(res.statusCode).toBe(404);
    });
  });


  describe("DELETE /courses/reject/:id", () => {

    it("should reject course", async () => {
      const mockCourse = {
        save: jest.fn(),
        status: "pending",
      };

      Course.findById.mockResolvedValue(mockCourse);

      const res = await request(app)
        .delete("/courses/reject/course123");

      expect(res.statusCode).toBe(200);
      expect(mockCourse.status).toBe("rejected");
      expect(mockCourse.save).toHaveBeenCalled();
    });

    it("should return 404 if course not found", async () => {
      Course.findById.mockResolvedValue(null);

      const res = await request(app)
        .delete("/courses/reject/course123");

      expect(res.statusCode).toBe(404);
    });
  });


  describe("PUT /approve-user/:id", () => {

    it("should approve instructor user", async () => {
      const mockUser = {
        _id: "user123",
        username: "john",
        email: "john@test.com",
        role: "instructor",
        isApproved: false,
        save: jest.fn(),
      };

      User.findById.mockResolvedValue(mockUser);
      Notification.updateMany.mockResolvedValue({});

      const res = await request(app)
        .put("/approve-user/user123");

      expect(res.statusCode).toBe(200);
      expect(mockUser.isApproved).toBe(true);
      expect(mockUser.approvedBy).toBe("admin123");
    });

    it("should return 400 if user already approved", async () => {
      User.findById.mockResolvedValue({
        role: "instructor",
        isApproved: true,
      });

      const res = await request(app)
        .put("/approve-user/user123");

      expect(res.statusCode).toBe(400);
    });

    it("should return 404 if user not found", async () => {
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .put("/approve-user/user123");

      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /reject-user/:id", () => {

    it("should delete freelancer/instructor", async () => {
      const mockUser = {
        role: "freelancer",
      };

      User.findById.mockResolvedValue(mockUser);
      User.findByIdAndDelete = jest.fn().mockResolvedValue(true);

      const res = await request(app)
        .delete("/reject-user/user123");

      expect(res.statusCode).toBe(200);
      expect(User.findByIdAndDelete).toHaveBeenCalledWith("user123");
    });

    it("should return 404 if user not found", async () => {
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .delete("/reject-user/user123");

      expect(res.statusCode).toBe(404);
    });
  });

});