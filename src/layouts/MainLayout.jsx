import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-160px)] bg-white dark:bg-slate-950 transition-colors duration-200">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
