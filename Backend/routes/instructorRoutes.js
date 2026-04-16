const express = require("express"); 
const router = express.Router(); 

const { protect, instructorOnly } = require('../middleware/authMiddleware'); 
const { getUploadedCourse, uploadCourse, myCourse, reqPublish, recentAddedCourse, 
    earnings, editCourse, getModules, deleteCourse, 
    editModules, getJoinedUsers, completeOnlineClass, createOnlineClass,
    openClassInstructor
 } = require('../controllers/instructorController'); 
const upload = require('../middleware/multer');

router.get("/courses",protect,instructorOnly,getUploadedCourse); 
router.get("/courses/recent",protect,instructorOnly,recentAddedCourse);
router.post("/course",protect,instructorOnly,upload.single("thumbnail"),uploadCourse); 
router.get("/courses/count",protect,instructorOnly,myCourse);
router.get("/earnings",protect,instructorOnly,earnings);
router.post("/online-class",protect,instructorOnly, createOnlineClass);

router.get("/modules/:id",protect,instructorOnly,getModules); 
router.put("/request-publish/:id",protect,instructorOnly,reqPublish);
router.put("/edit-course/:id",protect,instructorOnly,editCourse);
router.put("/edit-module/:id",protect,instructorOnly,editModules);
router.delete("/course/:id",protect,instructorOnly,deleteCourse);
router.get("/online-class/joined-users/:id",protect,instructorOnly,getJoinedUsers); 
router.post("/online-class/completed/:id",protect,instructorOnly, completeOnlineClass);
router.get("/online-class/:id",protect,instructorOnly,openClassInstructor)
module.exports = router ; 