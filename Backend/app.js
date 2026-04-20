//This is for Unit testing


const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/users", require("./routes/userRoutes"));

app.use((req, res, next) => {
  req.user = { id: "instructor123", role: "instructor" };
  next();
});

app.use((req, res, next) => {
  req.file = { filename: "test.jpg" };
  next();
});

// ROUTE
app.post("/api/instructor/course", require("./controllers/instructorController").uploadCourse);


module.exports = app;