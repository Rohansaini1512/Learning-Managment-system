import { Route,Routes } from "react-router-dom"

import RequireAuth from "./Components/Auth/RequireAuth";
import AboutUs from "./Pages/AboutUs";
import Contact from "./Pages/Contact";
import CourseDescription from "./Pages/Course/CourseDescription";
import CourseList from "./Pages/Course/CourseList";
import CreateCourse from "./Pages/Course/CreateCourse";
import Denied from "./Pages/Denied";
// import HomeLayout from "./Layouts/HomeLayout";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import NotFound from "./Pages/NotFound";
import Signup from "./Pages/Signup";

function App() {

  return (
    <>
      <Routes>
      <Route path="/" element={<HomePage />} ></Route>
      <Route path="/about" element={<AboutUs />} ></Route>
      <Route path="/courses" element={<CourseList />}/>
      <Route path="/contact" element={<Contact />}/>
      <Route path="/denied" element={<Denied />}/>
      <Route path="/course/description" element={<CourseDescription />}/>
      <Route path="/signup" element={<Signup />}></Route>
      <Route path="/login" element={<Login />}/>
      <Route path="*" element={<NotFound />}></Route>

      <Route element={<RequireAuth allowedRoles={["ADMIN"]}/>}>
        <Route path="/course/create" element={<CreateCourse />}/>
      </Route>
      </Routes>
      
    </>
  )
}

export default App
