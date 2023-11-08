import React, { useState, useEffect, useCallback } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import { Tooltip, Zoom } from "@mui/material";
import Box from "./Box";
import {
  useContractApprove,
  useContractCall,
  useContractSend,
} from "@/hooks/contract";

interface ProductProps {
  id: string;
  setError: (error: string) => void;
  setLoading: (loading: string | null) => void;
  clear: () => void;
}

interface Product {
  owner: string;
  name: string;
  image: string;
  description: string;
  location: string;
  price: number;
  sold: number;
  supply: number;
  available: number;
}

const Product: React.FC<ProductProps> = ({ id, setError, setLoading, clear }) => {
  const [orders, setOrders] = useState(1);
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { data: rawProduct } = useContractCall("readProduct", [id], true);
  const { writeAsync: purchase } = useContractSend("buyProduct", [Number(id), orders]);
  const [product, setProduct] = useState<Product | null>(null);
  const { writeAsync: approve } = useContractApprove(
    product?.price ? (product.price * orders).toString() : "0"
  );

  const getFormattedProduct = useCallback(() => {
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

  useEffect(() => {
    getFormattedProduct();
  }, [getFormattedProduct]);

  const handlePurchase = async () => {
    if (!approve || !purchase) {
      setError("Failed to purchase this product");
      return;
    }

    try {
      const approveTx = await approve();
      await approveTx.wait(1);
      setLoading("Purchasing...");
      const res = await purchase();
      await res.wait();
      toast.success("Product purchased successfully");
    } catch (error) {
      console.error(error);
      setError(error?.reason || error?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(null);
    }
  };

  const purchaseProduct = async () => {
    setLoading("Approving ...");
    clear();

    if (!address && openConnectModal) {
      openConnectModal();
      return;
    }

    try {
      await toast.promise(handlePurchase(), {
        pending: "Purchasing product...",
        success: "Product purchased successfully",
        error: "Failed to purchase product",
      });
    } catch (error) {
      console.error(error);
      setError(error?.reason || error?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(null);
    }
  };

  if (!product) return null;

  return (
    <div>
      {/* ... JSX for displaying product ... */}
      <Box product={product} orders={orders} setOrders={setOrders} purchase={purchaseProduct} />
    </div>
  );
};

export default Product;
