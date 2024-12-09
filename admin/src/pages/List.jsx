import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";
import { assets } from "../assets/assets";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("New Arrivals");
  //  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  //  const [sizes, setSizes] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setName(product.name || "");
    setDescription(product.description || "");
    setPrice(product.price?.toString() || "");
    setCategory(product.category || "New Arrivals");
    setBestseller(product.bestseller || false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const sanitizedPrice = price ? price.trim() : "";
      const convertedPrice = Number(sanitizedPrice);

      if (isNaN(convertedPrice)) {
        toast.error("Please enter a valid price.");
        return;
      }

      const payload = {
        id: selectedProduct._id,
        name,
        description,
        price: convertedPrice,
        category,
        bestseller,
      };

      console.log("Payload:", payload);

      const response = await axios.post(
        backendUrl + "/api/product/edit",
        payload,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setPrice("");
        closeModal();
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">All Products List</p>
      <div className="flex flex-col gap-2">
        {/* ------- List Table Title ---------- */}

        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Action</b>
        </div>

        {/* ------ Product List ------ */}

        {list.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            key={index}
          >
            <img className="w-12" src={item.image[0]} alt="" />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>
              {currency}
              {item.price}
            </p>
            <div className="flex items-center justify-center gap-3">
              <img
                onClick={() => openModal(item)}
                className="w-5 sm:w-5 cursor-pointer"
                src={assets.pencil}
                alt="edit book"
              />
              <img
                onClick={() => removeProduct(item._id)}
                className="w-5 sm:w-5 cursor-pointer"
                src={assets.bin_icon}
                alt="remove book"
              />
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-[90%] max-w-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              ✖
            </button>
            <h2 className="text-lg font-semibold mb-4">
              Edit Product: {selectedProduct?.name}
            </h2>

            <form onSubmit={onSubmitHandler} className="flex flex-col gap-6">
              <div>
                <div className="w-full">
                  <p className="mb-2">Product name</p>
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    className="w-full max-w-[500px] px-3 py-2"
                    type="text"
                    placeholder="Type here"
                    required
                  />
                </div>

                <div className="w-full">
                  <p className="mb-2">Product description</p>
                  <textarea
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md h-32"
                    type="text"
                    placeholder="Write content here"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
                  <div>
                    <p className="mb-2">Product category</p>
                    <select
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2"
                    >
                      <option value="newarrivals">New Arrivals</option>
                      <option value="fiction">Fiction</option>
                      <option value="nonfiction">Non Fiction</option>
                    </select>
                  </div>

                  <div>
                    <p className="mb-2">Product Price</p>
                    <input
                      onChange={(e) => setPrice(e.target.value)}
                      value={price}
                      className="w-full px-3 py-2 sm:w-[120px]"
                      type="Number"
                      placeholder="25"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <input
                  onChange={() => setBestseller((prev) => !prev)}
                  checked={bestseller}
                  type="checkbox"
                  id="bestseller"
                />
                <label className="cursor-pointer" htmlFor="bestseller">
                  Add to bestseller
                </label>
              </div>

              <button
                type="submit"
                className="w-28 py-3 mt-4 bg-black text-white"
              >
                UPDATE
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default List;
