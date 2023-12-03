import { Outlet } from "react-router-dom";

import Navbar from "../Component/Navber/Navber";

const Main = () => {
     return (
          <div>

               <Navbar></Navbar>


               <Outlet></Outlet>

          </div>
     );
};

export default Main;