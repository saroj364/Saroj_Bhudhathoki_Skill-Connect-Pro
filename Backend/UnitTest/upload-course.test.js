jest.mock("../models/courseModel");
jest.mock("../models/modules");

const request = require("supertest");
const app = require("../app");
const Course = require("../models/courseModel");
const Module = require("../models/modules");

afterEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/instructor/course", () => {

  it("should upload course with modules", async () => {

    Course.prototype.save = jest.fn().mockResolvedValue(true);
    Module.insertMany = jest.fn().mockResolvedValue(true);

    const res = await request(app)
      .post("/api/instructor/course")
      .send({ 
        title: "Test Course",
        description: "Test Desc",
        price: 100,
        duration: "2h",
        category: "Programming",
        modules: JSON.stringify([
          { title: "Module 1" },
          { title: "Module 2" }
        ])
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Course.prototype.save).toHaveBeenCalled();
    expect(Module.insertMany).toHaveBeenCalled();
  });
  it("should return 400 if required fields missing", async () => {

    const res = await request(app)
      .post("/api/instructor/course")
      .send({ title: "Test Course" });

    expect(res.statusCode).toBe(400);
  });
    it("should return 400 for invalid modules format", async () => {

    const res = await request(app)
        .post("/api/instructor/course")
        .send({
        title: "Test",
        description: "Desc",
        price: 100,
        duration: "2h",
        category: "IT",
        modules: "invalid-json"
        });

    expect(res.statusCode).toBe(400);
    });
    it("should return 400 if modules is not an array", async () => {

    const res = await request(app)
        .post("/api/instructor/course")
        .send({
        title: "Test",
        description: "Desc",
        price: 100,
        duration: "2h",
        category: "IT",
        modules: JSON.stringify({ title: "wrong" })
        });

    expect(res.statusCode).toBe(400);
    });
    it("should reject if modules exceed 12", async () => {

    const modules = Array(13).fill({ title: "Module" });

    const res = await request(app)
        .post("/api/instructor/course")
        .send({
        title: "Test",
        description: "Desc",
        price: 100,
        duration: "2h",
        category: "IT",
        modules: JSON.stringify(modules)
        });

    expect(res.statusCode).toBe(400);
    });
  it("should upload course without modules", async () => {

    Course.prototype.save = jest.fn().mockResolvedValue(true);

    const res = await request(app)
      .post("/api/instructor/course")
      .send({
        title: "Test Course",
        description: "Desc",
        price: 100,
        duration: "2h",
        category: "IT"
      });

    expect(res.statusCode).toBe(200);
    expect(Module.insertMany).not.toHaveBeenCalled();
  });

});