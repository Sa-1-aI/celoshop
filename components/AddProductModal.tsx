import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAccount, useBalance } from "wagmi";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";
import { useContractSend } from "@/hooks/contract/useContractWrite";
import erc20Instance from "../abi/erc20.json";

const AddProductModal = () => {
  const [visible, setVisible] = useState(false);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("0"); // Fix: Initialize as a string
  const [productImage, setProductImage] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productLocation, setProductLocation] = useState("");
  const [productSupply, setProductSupply] = useState("0"); // Fix: Initialize as a string
  const [debouncedProductName] = useDebounce(productName, 500);
  const [debouncedProductPrice] = useDebounce(productPrice, 500);
  const [debouncedProductImage] = useDebounce(productImage, 500);
  const [debouncedProductDescription] = useDebounce(productDescription, 500);
  const [debouncedProductLocation] = useDebounce(productLocation, 500);
  const [debouncedProductSupply] = useDebounce(productSupply, 500);
  const [loading, setLoading] = useState("");
  const [displayBalance, setDisplayBalance] = useState(true); // Fix: Initialize as true

  const isComplete =
    productName &&
    productPrice &&
    productImage &&
    productLocation &&
    productDescription &&
    productSupply;

  const clearForm = () => {
    setProductName("");
    setProductPrice("0"); // Fix: Initialize as a string
    setProductImage("");
    setProductDescription("");
    setProductLocation("");
    setProductSupply("0"); // Fix: Initialize as a string
  };

  const productPriceInWei = ethers.utils.parseEther(
    debouncedProductPrice || "0"
  );

  const { writeAsync: createProduct } = useContractSend("writeProduct", [
    debouncedProductName,
    debouncedProductImage,
    debouncedProductDescription,
    debouncedProductLocation,
    productPriceInWei,
    debouncedProductSupply,
  ]);

  const handleCreateProduct = async () => {
    if (!createProduct) {
      throw new Error("Failed to create product"); // Fix: Throw an error
    }
    setLoading("Creating...");
    if (!isComplete) throw new Error("Please fill all fields");
    const createProductTx = await createProduct(); // Fix: Rename to createProductTx
    setLoading("Waiting for confirmation...");
    await createProductTx.wait();
    setVisible(false);
    clearForm();
  };

  const addProduct = async (e) => {
    e.preventDefault();
    const { isConnected } = useAccount();
    const { data: cusdBalance } = useBalance({
      address: isConnected ? useAccount().address : undefined,
      token: erc20Instance.address as `0x${string}`,
    });

    if (!isConnected) {
      toast.error("You need to connect your wallet.");
      return;
    }

    if (parseFloat(cusdBalance) < parseFloat(debouncedProductPrice)) {
      toast.error("Not enough cUSD balance to create the product.");
      return;
    }

    try {
      await toast.promise(handleCreateProduct(), {
        pending: "Creating product...",
        success: "Product created successfully",
        error: "Something went wrong. Try again.",
      });
    } catch (e) {
      console.log({ e });
      toast.error(e?.message || "Something went wrong. Try again.");
    } finally {
      setLoading("");
    }
  };

  useEffect(() => {
    const { address, isConnected } = useAccount();
    const { data: cusdBalance } = useBalance({
      address,
      token: erc20Instance.address as `0x${string}`,
    });

    if (isConnected && cusdBalance) {
      setDisplayBalance(true);
    }
  }, []);

  return (
    <div className={"flex flex-row w-full justify-between"}>
      <div>
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="inline-block ml-4 px-6 py-2.5 bg-black text-white font-medium text-md leading-tight rounded-2xl shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
        >
          Add Product
        </button>

        {visible && (
          <div className="fixed z-40 overflow-y-auto top-0 w-full left-0" id="modal">
            <form onSubmit={addProduct}>
              <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity">
                  <div className="absolute inset-0 bg-gray-900 opacity-75" />
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                  &#8203;
                </span>
                <div
                  className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="modal-headline"
                >
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <label>Product Name</label>
                    <input
                      onChange={(e) => setProductName(e.target.value)}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Product Image (URL)</label>
                    <input
                      onChange={(e) => setProductImage(e.target.value)}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Product Description</label>
                    <input
                      onChange={(e) => setProductDescription(e.target.value)}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                      placeholder="Max 200 characters"
                      maxLength={200}
                    />

                    <label>Product Location</label>
                    <input
                      onChange={(e) => setProductLocation(e.target.value)}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Product Supply</label>
                    <input
                      onChange={(e) => setProductSupply(e.target.value)}
                      required
                      type="number"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                      min={1}
                    />

                    <label>Product Price (cUSD)</label>
                    <input
                      onChange={(e) => setProductPrice(e.target.value)}
                      required
                      type="number"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                      min={1}
                      step={1}
                    />
                  </div>
                  <div className="bg-gray-200 px-4 py-3 text-right">
                    <button
                      type="button"
                      className="py-2 px-4 bg-gray-500 text-white rounded hover-bg-gray-700 mr-2"
                      onClick={() => setVisible(false)}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!!loading || !isComplete || !createProduct}
                      className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
                    >
                      {loading ? loading : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {displayBalance && (
        <span
          className="inline-block text-dark ml-4 px-6 py-2.5 font-medium text-md leading-tight rounded-2xl shadow-none"
        >
          Balance: {Number(cusdBalance?.formatted || 0).toFixed(2)} cUSD
        </span>
      )}
    </div>
  );
};

export default AddProductModal;
