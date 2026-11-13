import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { AlertTriangle, ArrowRight, ArrowRightIcon, Home, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/common/SEO";
import { ROUTES } from "@/constants/routes";

/** Route-level error boundary rendered by react-router on thrown errors. */
export default function Test() {
  return (
    <div className="flex w-screen h-screen justify-center items-center bg-blue-400">
      <div className="card flex  w-[800px] h-[280px] rounded-xl bg-white  flex-col">
        <div className="items py-4 px-6 flex justify-between items-center ">
          <div className="text-gray-400 text-xs font-bold"> CURRENT WEATHER</div>
          <small className="font-bold"> 1:58 PM</small>
        </div>
        <div className="items py-4 px-6 flex-1 flex gap-2 w-fit   items-center">
          <div className=" flex items-center flex-col gap-4">
            <div className="flex gap-2 ">
              <img
                src="https://cdn.vectorstock.com/i/1000v/82/33/sun-cloud-icon-vector-9848233.jpg"
                alt="sun"
                width="150px"
                height="150px"
              />
              <div className="flex flex-col ">
                <h1 className="text-[68px]">46</h1>
                <small className="text-[18px] text-gray-500">RealFeel 45</small>
              </div>
            </div>
            <div className=" -ml-32">
              <p className="self-start font-bold text-lg ">Hazy sunshine</p>
              <div className=" flex items-center justify-start ">
                <span className="cursor-pointer text-black text-xs font-medium">MORE DETAILS </span>{" "}
                <ArrowRightIcon className="text-xs p-1" />
              </div>
            </div>
          </div>

          <div className="flex-1 ">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between border-b">
                <p>ReelFeel Shade</p>
                <p className="text-black font-bold">43</p>
              </div>
              <div className="flex justify-between border-b">
                <p>Wind</p>
                <p className="text-black font-bold">WNW 31km/h</p>
              </div>
              <div className="flex justify-between border-b">
                <p>Wind Gust</p>
                <p className="text-black font-bold">58 km/h</p>
              </div>
              <div className="flex justify-between border-b">
                <p>Air Quality</p>
                <p className="text-purple-500 font-bold ">Very Unhealthy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
