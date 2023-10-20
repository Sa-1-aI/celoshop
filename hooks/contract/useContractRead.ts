// This hook is used to read from a smart contract

// Import the wagmi hook to read from a smart contract
import { useContractRead } from 'wagmi';
// Import the Shop ABI(Interface)
import ShopInstance from "../../abi/Shop.json";

// read from smart contract
export const useContractCall = (functionName: string, args?: Array<any>, watch?: boolean, from? : `0x${string}` | undefined) => {
    const resp = useContractRead({
        // The address of the smart contract, in this case the Shop from the JSON file
        address: ShopInstance.address as `0x${string}`,
        // The ABI of the smart contract, in this case the Shop from the JSON file
        abi: ShopInstance.abi,
        // The smart contract function name to call
        functionName: functionName,
        // The arguments to pass to the smart contract function
        args,
        // A boolean to watch for changes in the smart contract. If true, the hook will re-run when the smart contract changes
        watch,
        // The address of the user to call the smart contract function from which is optional
        overrides: from ? { from } : undefined,
        onError: (err) => {
            console.log({ err })
        }
    })

    return resp
}