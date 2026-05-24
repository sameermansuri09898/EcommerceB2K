import {Plus,Minus,X,IndianRupee} from 'lucide-react'
import React from 'react'
import { useNavigate } from "react-router-dom";
import Nav from '../layout/navbar'
import Footer from '../layout/footer'

export default function Cart(){

  // const navugate=useNavigate();
  return(
   <>

  
   <div className="cart-conatiner p-1 md:p-10 mt-10">

   <div className="cart bg-white shadow-lg  w-full rounded-3xl md:p-8 flex flex-col md:flex-row">

 <div className="w-full lg:w-[70%] bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5 overflow-hidden">

  {/* heading */}
  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

    <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">
      Shopping Cart
    </h2>

    <span className="text-sm text-gray-500">
      Total Items :
      <span className="font-semibold text-black ml-1">
        5
      </span>
    </span>

  </div>

  <div className="w-full h-[1px] bg-gray-200 mt-4"></div>

  {/* items */}
  <div className="mt-5 space-y-5">

    {/* item */}
    <div className="flex flex-col border-b border-gray-200 pb-5" >
      {/* top */}
      <div className="flex gap-3">
        {/* image */}
        <div className="shrink-0">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfmkVYBjXK4zYz2a0X6ED2MFC4bvLVXOzCw-vjQ2W1Lq1QiOG_Wcpr_HQ&s"
            alt=""
            className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border "/>

        </div>
        {/* details */}
        <div className="flex flex-col flex-1 min-w-0">

          <h3 className=" text-sm sm:text-base font-medium text-gray-800 leading-5 line-clamp-2  " >
            Noise Smart Watch with AMOLED Display
          </h3>

          <span className="text-green-600 text-xs sm:text-sm mt-1">
            In Stock
          </span>

          <span className="text-xs text-gray-500 mt-1">
            Eligible for FREE Shipping
          </span>

          <span className="text-sm text-gray-600 mt-1">
            Size :
            <span className="font-medium ml-1">
              XL
            </span>
          </span>

          {/* mobile price */}
          <div className="mt-2 flex items-center gap-2">

            <span className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <IndianRupee size={16} />
              1,200
            </span>

            <span className="text-xs sm:text-sm text-gray-400 line-through flex items-center">
              <IndianRupee size={12} />
              1,999
            </span>

          </div>

        </div>
      </div>

      {/* bottom */}
      <div className=" mt-4 flex flex-col sm:flex-row  sm:items-center sm:justify-between  gap-4 " >
        {/* quantity + actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* quantity */}
          <div className=" flex items-center border rounded-fulloverflow-hidden bg-gray-50  ">
             <button className=" px-3 py-1.5 hover:bg-gray-200 transition">
              <Minus size={15} />
            </button>

            <span className="px-4 text-sm font-medium">
              5
            </span>

            <button className="px-3 py-1.5 hover:bg-gray-200 transition">
              <Plus size={15} />
            </button>

          </div>

          {/* delete */}
          <button className="text-sm text-blue-600 hover:underline ">
            Delete
          </button>
          {/* save */}
          <button className="text-sm text-blue-600 hover:underline ">
              Save for later
          </button>

        </div>

        {/* total */}
        <div className="flex items-center text-sm sm:text-base">

          <span className="text-gray-600">
            Total :
          </span>

          <span className="font-semibold text-black ml-2 flex items-center">
            <IndianRupee size={15} />
            6,000
          </span>

        </div>

      </div>

    </div>

  </div>
</div>

 <div
  className="
    oders-summary
    w-full lg:w-[30%]
    bg-white
    border border-gray-200
    rounded-xl
    shadow-sm
    h-fit
    sticky top-24
  "
>

  {/* top */}
  <div className="py-4 px-4 sm:px-5">

    <div className="intro flex items-center justify-between">

      <span className="text-gray-500 text-sm font-medium">
        Shopping Cart
      </span>

      <span className="text-gray-800 text-sm font-semibold">
        Order Summary
      </span>

    </div>

    {/* line */}
    <div className="h-[1px] w-full bg-gray-200 mt-4"></div>

    {/* summary details */}
    <div className="mt-5 space-y-4">

      {/* subtotal */}
      <div className="flex items-center justify-between">

        <span className="text-sm text-gray-600">
          Subtotal
        </span>

        <span className="flex items-center text-sm font-medium">
          <IndianRupee size={14} />
          7500
        </span>

      </div>

      {/* shipping */}
      <div className="flex items-center justify-between">

        <span className="text-sm text-gray-600">
          Shipping
        </span>

        <span className="text-sm text-green-600 font-medium">
          FREE
        </span>

      </div>

      {/* discount */}
      <div className="flex items-center justify-between">

        <span className="text-sm text-gray-600">
          Discount
        </span>

        <span className="flex items-center text-sm text-green-600 font-medium">
          - <IndianRupee size={14} />
          1,500
        </span>

      </div>

      {/* tax */}
      <div className="flex items-center justify-between">

        <span className="text-sm text-gray-600">
          Tax
        </span>

        <span className="flex items-center text-sm font-medium">
          <IndianRupee size={14} />
          200
        </span>

      </div>

      {/* line */}
      <div className="h-[1px] w-full bg-gray-200"></div>

      {/* total */}
      <div className="flex items-center justify-between">

        <span className="text-base font-semibold text-gray-800">
          Total
        </span>

        <span className="flex items-center text-lg font-bold text-black">
          <IndianRupee size={16} />
          6200
        </span>

      </div>

      {/* save */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">

        <span className="text-sm text-green-700 font-medium">
          🎉 You saved ₹1,500 on this order
        </span>

      </div>

      {/* checkout button */}
      <button
        className="
          w-full
          bg-yellow-400
          hover:bg-yellow-500
          text-black
          font-semibold
          py-3
          rounded-lg
          transition
          mt-2
        "
      >
        Proceed to Checkout
      </button>

      {/* secure text */}
      <div className="text-center">

        <span className="text-xs text-gray-500">
          Safe and Secure Payments. Easy returns.
        </span>

      </div>

    </div>

  </div>
</div>

   </div>
   </div>
   
</>

  )


}