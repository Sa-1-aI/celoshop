/* eslint-disable @next/next/no-img-element */
// This component displays and enables the purchase of a product
import Box from "./Box";
// Importing the dependencies
import { useCallback, useEffect, useState } from "react";
// Import the useConnectModal hook to trigger the wallet connect modal
import { useConnectModal } from "@rainbow-me/rainbowkit";
// Import the useAccount hook to get the user's address
import { useAccount } from "wagmi";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import our custom identicon template to display the owner of the product
import { identiconTemplate } from "@/helpers/index";
// Import our custom hooks to interact with the smart contract
import { useContractApprove } from "@/hooks/contract/useApprove";
import { useContractCall } from "@/hooks/contract/useContractRead";
import { useContractSend } from "@/hooks/contract/useContractWrite";
// import reac-tooltip library to show a tooltip when hovering over specific points
import { Tooltip, Zoom } from "@mui/material";


// Define the interface for the product, an interface is a type that describes the properties of an object
interface Product {
  name: string;
  price: number;
  owner: string;
  image: string;
  description: string;
  location: string;
  sold: number;
  supply: number;
  available: number;
}

// Define the Product component which takes in the id of the product and some functions to display notifications
const Product = ({ id, setError, setLoading, clear }: any) => {
  // customer orders * product price
  const [orders, setOrders] = useState(1);

  // Use the useAccount hook to store the user's address
  const { address } = useAccount();
  // Use the useContractCall hook to read the data of the product with the id passed in, from the marketplace contract
  const { data: rawProduct }: any = useContractCall("readProduct", [id], true);
  // Use the useContractSend hook to purchase the product with the id passed in, via the marketplace contract
  const { writeAsync: purchase } = useContractSend("buyProduct", [
    Number(id),
    orders,
  ]);
  const [product, setProduct] = useState<Product | null>(null);
  // Use the useContractApprove hook to approve the spending of the product's price, for the ERC20 cUSD contract
  const { writeAsync: approve } = useContractApprove(product?.price? (product.price * orders).toString() : "0");
  // Use the useConnectModal hook to trigger the wallet connect modal
  const { openConnectModal } = useConnectModal();
  // Format the product data that we read from the smart contract
  const getFormatProduct = useCallback(() => {
    if (!rawProduct) return null;
    setProduct({
      owner: rawProduct[0],
      name: rawProduct[1],
      image: rawProduct[2],
      description: rawProduct[3],
      location: rawProduct[4],
      price: Number(rawProduct[5]),
      sold: Number(rawProduct[6]),
      supply: Number(rawProduct[7]),
      available: Number(rawProduct[8]),
    });
  }, [rawProduct]);

  // Call the getFormatProduct function when the rawProduct state changes
  useEffect(() => {
    getFormatProduct();
  }, [getFormatProduct]);
  // Define the handlePurchase function which handles the purchase interaction with the smart contract
  const handlePurchase = async () => {
    if (!approve || !purchase) {
      throw "Failed to purchase this product";
    }
    // Approve the spending of the product's price, for the ERC20 cUSD contract
    const approveTx = await approve();
    // Wait for the transaction to be mined, (1) is the number of confirmations we want to wait for
    await approveTx.wait(1);
    setLoading("Purchasing...");
    // Once the transaction is mined, purchase the product via our marketplace contract buyProduct function
    const res = await purchase();
    // Wait for the transaction to be mined
    await res.wait();
  };

  // Define the purchaseProduct function that is called when the user clicks the purchase button
  const purchaseProduct = async () => {
    setLoading("Approving ...");
    clear();

    try {
      // If the user is not connected, trigger the wallet connect modal
      if (!address && openConnectModal) {
        openConnectModal();
        return;
      }
      // If the user is connected, call the handlePurchase function and display a notification
      await toast.promise(handlePurchase(), {
        pending: "Purchasing product...",
        success: "Product purchased successfully",
        error: "Failed to purchase product",
      });
      // If there is an error, display the error message
    } catch (e: any) {
      console.log({ e });
      setError(e?.reason || e?.message || "Something went wrong. Try again.");
      // Once the purchase is complete, clear the loading state
    } finally {
      setLoading(null);
      window.location.reload()
    }
  };

  // If the product cannot be loaded, return null
  if (!product) return null;


  // Return the JSX for the product component
  return (
    <div>
      <div className="container px-4 mx-auto">
        <div>
          <div className="card cursor-pointer">
            <div className="thumbnail">
              <img data-src={product.image} src={product.image} />
            </div>
            <div className="details">
              <div className="absolute bg-black h-9 w-9 -top-5 right-3 rounded-full text-white leading-9 text-center font-bold">
                {product.available}
              </div>
              <div className="font-raleway text-lg overflow-hidden text-ellipsis whitespace-nowrap">
                <a href="/gallery/aleister_disconnected_pig-show">
                  {product.name}
                </a>
              </div>
              <div className="mt-3">
                {" "}
                by
                <a
                  className="user-product-picture"
                  target="_blank"
                  href={`https://explorer.celo.org/alfajores/address/${product.owner}`}
                >
                  {identiconTemplate(product.owner)}
                </a>
              </div>
              {/* Button */}

              <div className={"absolute right-0 bottom-0"}>
                <Tooltip
                  TransitionComponent={Zoom}
                  placement="top"
                  title={product.location}
                  arrow
                >
                  <img src={"/location.svg"} alt="Location" className={"w-9"} />
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Box
        product={product}
        orders={orders}
        setOrders={setOrders}
        purchase={purchaseProduct}
      />
    </div>
  );
};

export default Product;
