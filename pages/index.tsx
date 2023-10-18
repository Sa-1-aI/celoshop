// This is the main page of the app

// Import the AddProductModal and ProductList components
import AddProductModal from "@/components/AddProductModal";
import ProductList from "@/components/ProductList";

// Export the Home component
export default function Home() {
  const data = false;
  return (
    <div>
        <AddProductModal />
        <ProductList />
    </div>
  )
}