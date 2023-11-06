import React from "react";
// Import ethers to format the price of the product correctly
import { ethers } from "ethers";
import { useState } from "react";
// Import our custom identicon template to display the owner of the product
import { identiconTemplate } from "@/helpers/index";
// Import icons for increase and decrease orders and close box component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleUp,
  faAngleDown
} from "@fortawesome/free-solid-svg-icons";
import { faClose } from "@fortawesome/free-solid-svg-icons";
// Import the toast library to display notifications
import { toast } from "react-toastify";


function Box({ product, purchase, orders, setOrders }: any) {
  const [data, setData] = useState("inActive"); // Active or deactive Box Component.
  const [buy, setBuy] = useState(product.sold); // buy variable show the number of products that users want to buy at the moment

  // Check if the product is not available, and if so, set the 'orders' to 0.
  if (product.available === 0) {
    setOrders(0);
  }

  // Increase the number of orders and products that user want to buy
  function incrementCounter() {
    if (orders === product.available) {
      toast.error("You can't do this action", {
        position: toast.POSITION.BOTTOM_CENTER
      });
    } else {
      setOrders(orders + 1);
      setBuy(buy + 1);
    }
  }

  // Decrease the number of orders and products that user want to buy
  function decrementCounter() {
    if (orders === 1 || product.available === 0) {
      toast.error("You can't do this action", {
        position: toast.POSITION.BOTTOM_CENTER
      });
    } else {
      setOrders(orders - 1);
      setBuy(buy - 1);
    }
  }

  // Close the box with icon and reset 'orders','buy' and 'data' variables
  function close() {
    setData("inActive");
    setOrders(1);
    setBuy(product.sold);
  }

  // Define a function to handle the purchase action. 
  function handlePurchase() {
    if(product.available!==0)
      purchase();
    else 
      toast.error("This product is not available now", {
        position: toast.POSITION.BOTTOM_CENTER
      });
  }

  // Active 'data' variable for displaying box component
  function handleBoxOn() {
    setData("active");
  }

  // Format the product price from Wei to a readable format.
  const productPriceFromWei = ethers.utils.formatEther(
    product.price.toString()
  );

  // Convert the product price to a floating-point number.
  const productPriceToInt = parseFloat(productPriceFromWei);
  
  // Return the JSX for the box component
  return (
    <div>
      <div className="flex items-center space-x-2 mt-3 purchaseButton">
        <button
          type="button"
          className="text-sm uppercase font-raleway opacity-75"
          onClick={() => handleBoxOn()}
        >
          Buy Now for
        </button>
        <img className="celo-usd priceLable" src="../7236.png" />
        <div>{productPriceFromWei}</div>
      </div>
      {data != "inActive" ? (
        <div className="box sm:block sm:p-0 " id="modal">
          <div className="fixed inset-0 ">
            <div className="absolute inset-0 bg-gray-900 opacity-75" />
          </div>
          <span className="hidden">&#8203;</span>
          <div className="box-thumbnail">
            <img data-src={product.image} src={product.image} />
          </div>
          <div className="box-details">
            <div className="user-picture">
              <a
                target="_blank"
                href={`https://explorer.celo.org/alfajores/address/${product.owner}`}
              >
                {identiconTemplate(product.owner)}
              </a>
            </div>
            <div className="title">{product.name}</div>
            <div className="description">{product.description}</div>
            <div className="supply">
              <p>
                I Want
                <div className="arrow">
                  <FontAwesomeIcon
                    onClick={incrementCounter}
                    className="up-arrow"
                    icon={faAngleUp}
                  />
                  <input
                    type="number"
                    className="wanted"
                    min="1"
                    max={product.supply}
                    defaultValue={"1"}
                    value={orders}
                    onWheel={(Event) => Event.currentTarget.blur()}
                    disabled={false}
                  />
                  <FontAwesomeIcon
                    onClick={decrementCounter}
                    className="down-arrow"
                    icon={faAngleDown}
                  />
                </div>
                From This
              </p>
              <div className="available">
                <span className="sold">{product.available===0 ? buy : buy + 1}</span> /{" "}
                <span className="total">{product.supply}</span>
              </div>
            </div>
            <button onClick={() => handlePurchase()} className="buy">
              Buy For {orders * productPriceToInt} USDC
            </button>
            <FontAwesomeIcon className="close" onClick={close} icon={faClose} />
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default Box;
