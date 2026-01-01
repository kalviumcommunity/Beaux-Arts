import React from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen  bg-zinc-50 font-sans dark:bg-black ">
        <Header/>
      {children}
        <Footer/>
    </main>
  );
};

export default Container;
