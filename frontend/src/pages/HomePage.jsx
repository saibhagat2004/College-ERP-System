import React from "react";
import { useState, useEffect } from "react";
import RoleSelector from "../components/RoleSelector";
import CreateUsers from "./Users/CreateUsers";
import { useQuery } from "@tanstack/react-query";
const HomePage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"]});
  
  return (
    <div className="relative">
      <h1 className="font-bold">{authUser?.role}</h1>
      <p className="text-red-400 font-extrabold">Home page</p>
      <h1 className="text-xl font-bold">{authUser?.fullName}</h1>
    </div>
  );
};

export default HomePage;
