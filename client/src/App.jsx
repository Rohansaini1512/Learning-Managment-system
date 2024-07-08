import { Route,Routes } from "react-router-dom"

import AboutUs from "./Pages/AboutUs";
import Contact from "./Pages/Contact";
import CourseList from "./Pages/Course/CourseList";
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
      <Route path="/signup" element={<Signup />}></Route>
      <Route path="/login" element={<Login />}/>
      <Route path="*" element={<NotFound />}></Route>
      </Routes>
      
    </>
  )
}

export default App
