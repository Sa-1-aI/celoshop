import React from "react";
import { ethers } from "ethers";
import { useState } from "react";
import { identiconTemplate } from "@/helpers/index";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleUp,
  faAngleDown,
  faWindowClose,
} from "@fortawesome/free-solid-svg-icons";
import { faClose } from "@fortawesome/free-solid-svg-icons";


function Box({ product, purchase, orders, setOrders }: any) {

  const [data, setData] = useState("inActive");

  const [remain, setRemain] = useState(product.sold);

  // products not available
  if (product.available === 0) {
    setOrders(0);
  }

  function incrementCounter() {
    // value = orders , max = inputMax , min = 1
    if (orders === product.available) {
      console.log("Full");
    } else {
      setOrders(orders + 1);
      setRemain(remain + 1);
    }
  }

  function decrementCounter() {
    // value = orders , max = inputMax , min = 1
    if (orders === 1 || product.available === 0) {
      console.log("You cant decrease more than this");
    } else {
      setOrders(orders - 1);
      setRemain(remain - 1);
    }
  }

  function close() {
    setData("inActive");
    setOrders(1);
    setRemain(product.sold);
  }

  function handlePurchase() {
    purchase();
  }

  function handleBoxOn() {
    setData("blur");
  }

  const productPriceFromWei = ethers.utils.formatEther(
    product.price.toString()
  );

  const productPriceToInt = parseFloat(productPriceFromWei);

  return (
    <div>
      <div className="flex items-center space-x-2 mt-3 purchaseButton">
        <button
          type="button"
          className="text-sm uppercase font-raleway opacity-75"
          onClick={() => handleBoxOn()}
          data-bs-toggle="modal"
          data-bs-target="#exampleModalCenter"
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
                <span className="sold">{product.available===0 ? remain : orders}</span> /{" "}
                <span className="total">{product.available}</span>
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
