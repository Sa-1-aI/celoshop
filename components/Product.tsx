/* eslint-disable @next/next/no-img-element */
import Box from "./Box";
import { useCallback, useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import { Tooltip, Zoom } from "@mui/material";
import { identiconTemplate } from "@/helpers/index";
import { useContractApprove } from "@/hooks/contract/useApprove";
import { useContractCall } from "@/hooks/contract/useContractRead";
import { useContractSend } from "@/hooks/contract/useContractWrite";

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

const Product = ({ id, setError, setLoading, clear }: any) => {
  const [orders, setOrders] = useState(1);

  const { address } = useAccount();
  const { data: rawProduct } = useContractCall("readProduct", [id], true);
  const { writeAsync: purchase } = useContractSend("buyProduct", [Number(id), orders]);
  const [product, setProduct] = useState<Product | null>(null);
  const { writeAsync: approve } = useContractApprove(product?.price ? (product.price * orders).toString() : "0");
  const { openConnectModal } = useConnectModal();

  const getFormatProduct = useCallback(() => {
    if (!rawProduct) return;
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

  useEffect(() => {
    getFormatProduct();
  }, [getFormatProduct]);

  const handlePurchase = async () => {
    if (!approve || !purchase) {
      throw new Error("Failed to purchase this product");
    }

    const approveTx = await approve();
    await approveTx.wait(1);
    setLoading("Purchasing...");

    const res = await purchase();
    await res.wait();
  };

  const purchaseProduct = async () => {
    setLoading("Approving ...");
    clear();

    try {
      if (!address && openConnectModal) {
        openConnectModal();
        return;
      }

      await toast.promise(handlePurchase(), {
        pending: "Purchasing product...",
        success: "Product purchased successfully",
        error: "Failed to purchase product",
      });
      
      // Conditionally reload the page after a successful purchase.
      // window.location.reload();
    } catch (e: any) {
      console.error({ e });
      setError(e?.reason || e?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(null);
    }
  };

  if (!product) return null;

  return (
    <div>
      <div className="container px-4 mx-auto">
        <div>
          <div className="card cursor-pointer">
            <div className="thumbnail">
              {/* Fix the 'data-src' attribute to 'data-src' */}
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
