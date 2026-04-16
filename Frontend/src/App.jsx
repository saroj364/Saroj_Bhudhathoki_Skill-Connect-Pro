import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ToastProvider } from "./components/Toast/ToastContext";
import ToastContainer from "./components/Toast/ToastContainer";
import Navbar from "./components/UserComponents/Navbar";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import LearnerHomePage from "./pages/Learner/Home";
import Courses from "./pages/Learner/Courses";
import CourseDetail from "./pages/Learner/CourseDetail";
import AboutUs from "./pages/Learner/AboutUs";
import Cart from "./pages/Learner/Cart";
import Profile from "./pages/Learner/Profile";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";
import ClassCall from "./pages/class/vcall";
import AdminCourses from "./pages/Admin/courses";
import InstructorCourses from "./pages/Instructor/courses";
import ProtectedRoute from "./components/RouteP";
import AdminUsers from "./pages/Admin/users";
import GuestRoute from "./components/RouteG";
import Contact from "./pages/UserPages/Contactus";
import AddCourse from "./pages/Instructor/course-add";
import CheckoutRedirect from "./pages/Learner/checkout";
import PaymentFailed from "./pages/payment/paymentfailed";
import PaymentSuccess from "./pages/payment/paymentsucess";
import OrdersPage from "./pages/Learner/Orders";
import EditCourse from "./pages/Instructor/course-edit";
import FreelancersPage from "./pages/Client/freelancer";
import FreelancerProfile from "./pages/Client/fl-profile";
import FreelancerDashboard from "./pages/FreeLancer/Dashboard";
import ClientChatList from "./pages/Client/chat";
import FreelancerChatList from "./pages/FreeLancer/chat";
import FreelancerGigs from "./pages/FreeLancer/gigs";
import ClientCompletedJobs from "./pages/Client/jobs";
import JobPaymentSuccess from "./pages/payment/job-paymentsuccess";
import JobPaymentFailed from "./pages/payment/job-paymentfailed";
import JobPaymentRedirect from "./pages/Client/payment-redirect";
import FreelanceProfile from "./pages/FreeLancer/profile";
import OnlineClassesPage from "./pages/class/oclass";
import CreateOnlineClass from "./pages/Instructor/class";
import ClassRoom from "./pages/class/vcall";


function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route element={<GuestRoute/>}>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Route>
          <Route path="/" element={<LearnerHomePage />} />
          <Route path="/navbar" element={<Navbar />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact-us" element={<Contact/>}/>
          <Route path="/freelancer" element={<FreelancersPage/>}/>
          <Route path="/freelancer/:id" element={<FreelancerProfile/>}/>

          
          <Route element={<ProtectedRoute/>}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<CheckoutRedirect />} />
            <Route path="/order" element={<OrdersPage/>}/>
            <Route path="/payment-success" element={<PaymentSuccess/>}/>
            <Route path="/payment-failed" element={<PaymentFailed/>} />
            <Route path="/client/chat" element={<ClientChatList/>}/>
            <Route path="/client/jobs" element={<ClientCompletedJobs/>} />
            <Route path="/job-payment-redirect" element={<JobPaymentRedirect/>}/>
            <Route path="/job-payment-success" element={<JobPaymentSuccess/>}/>
            <Route path="/job-payment-failed" element={<JobPaymentFailed/>}/>

            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/courses" element={<InstructorCourses/>} />
            <Route path="/instructor/add-course" element={<AddCourse/>}/> 
            <Route path="/instructor/edit-course/:id" element={<EditCourse/>}/>
            <Route path="/instructor/create-class" element={<CreateOnlineClass/>}/>

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<AdminCourses/>} />
            <Route path="/admin/all_users" element={<AdminUsers/>}/>

            <Route path="/freelancer/dashboard" element={<FreelancerDashboard/>}/>
            <Route path="/freelancer/chat" element={<FreelancerChatList/>}/>
            <Route path="/freelancer/gigs" element={<FreelancerGigs/>}/>
            <Route path="/freelancer/profile" element={<FreelanceProfile/>}/>

            <Route path="/online-class" element={<OnlineClassesPage/>}/>
            <Route path="/class-room/:id" element={<ClassRoom/>}/>
          </Route>


          <Route path="/class/:roomId" element={<ClassCall/>} />

        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
 
export default App;
