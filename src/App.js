import "./App.scss";
import { ToastContainer, toast } from "react-toastify";
import Header from "./components/Header";
import TableUsers from "./components/TableUsers";
import Container from "react-bootstrap/Container";
import { Route, Routes, Link } from "react-router-dom";
import Home from "./components/Home";

function App() {
  return (
    <>
      <div className="app-container">
        <Container>         
        <Header />
          {/* <TableUsers /> */}
          {/* <Home /> */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users" element={<TableUsers />} />
          </Routes>
        </Container>
        
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
