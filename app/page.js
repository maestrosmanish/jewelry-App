
"use client";


import Image from "next/image";
import { Children } from "react";
import DashBoard from "./dashboard/DashBoard";
import Section from "./dashboard/overview/page";

export default function Home({ children }) {
  return (
  <>
 <DashBoard>
 <Section/>
 </DashBoard>
  </>
  );
}
