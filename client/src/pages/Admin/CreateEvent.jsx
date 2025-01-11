import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout/Layout";
import AdminMenu from "./../../components/Layout/AdminMenu";
import toast from "react-hot-toast";
import axios from "axios";
import { Select } from "antd";
import { useNavigate } from "react-router-dom";
const { Option } = Select;

const CreateProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [photo, setPhoto] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [contact, setContact] = useState("");

  // Fetch all categories
  const getAllCategory = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const { data } = await axios.get(`${apiUrl}/api/v1/category/get-category`);
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in fetching categories");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  // Frontend validation before submitting the product creation form
  const validateForm = () => {
    if (!name) return "Name is Required";
    if (!description) return "Description is Required";
    if (!price) return "Price is Required";
    if (!category) return "Category is Required";
    if (!teamSize) return "Team size is Required";
    if (!venue) return "Venue is Required";
    if (!eventDate) return "Event date is Required";
    if (!contact) return "Contact information is Required";
    if (photo && photo.size > 1000000) return "Photo should be less than 1MB";
    return null;
  };

  // Create product function
  const handleCreate = async (e) => {
    e.preventDefault();
    const errorMessage = validateForm();
    const apiUrl = import.meta.env.VITE_API_URL;
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      const productData = new FormData();
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("photo", photo);
      productData.append("category", category);
      productData.append("team_size", teamSize);
      productData.append("venue", venue);
      productData.append("event_date", eventDate);
      productData.append("contact", contact);

      const { data } = await axios.post(`${apiUrl}/api/v1/event/create-event`, productData);
      if (data?.success) {
        toast.success("Product Created Successfully");
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while creating the product");
    }
  };

  return (
    <Layout title={"Dashboard - Create EVENT"}>
      <div className="w-full bg-gradient-to-r from-blue-50 via-indigo-100 to-purple-200 min-h-screen">
        <div className="container mx-auto p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Admin Menu */}
            <div className="col-span-12 md:col-span-3">
              <AdminMenu />
            </div>

            {/* Main content for creating product */}
            <div className="col-span-12 md:col-span-9">
              <h1 className="text-3xl font-semibold mb-6 text-gray-800">Create Event</h1>

              <div className="space-y-6 w-full md:w-3/4">
                {/* Category Select */}
                <Select
                  bordered={true}
                  placeholder="Select a category"
                  size="large"
                  showSearch
                  className="w-full mb-4"
                  onChange={(value) => setCategory(value)}
                  style={{ border: "2px solid #ddd", borderRadius: "0.375rem", padding: "0.5rem" }}
                >
                  {categories?.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>

                {/* Photo Upload */}
                <div>
                  <label className="border-2 border-gray-300 bg-white py-2 px-4 rounded-md shadow-sm cursor-pointer w-full text-center">
                    {photo ? photo.name : "Upload Photo"}
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={(e) => setPhoto(e.target.files[0])}
                      hidden
                    />
                  </label>
                </div>

                {/* Photo Preview */}
                {photo && (
                  <div className="text-center mt-4">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt="product_photo"
                      className="h-52 mx-auto object-cover rounded-md"
                    />
                  </div>
                )}

                {/* Product Details Inputs */}
                <div className="space-y-4">
                  <input
                    type="text"
                    value={name}
                    placeholder="Event Name"
                    className="border-2 border-gray-300 w-full px-4 py-2 rounded-md"
                    onChange={(e) => setName(e.target.value)}
                  />

                  <textarea
                    value={description}
                    placeholder="Event Description"
                    className="border-2 border-gray-300 w-full px-4 py-2 rounded-md"
                    onChange={(e) => setDescription(e.target.value)}
                  />

                  <input
                    type="number"
                    value={price}
                    placeholder="Event Price"
                    className="border-2 border-gray-300 w-full px-4 py-2 rounded-md"
                    onChange={(e) => setPrice(e.target.value)}
                  />

                  <input
                    type="text"
                    value={teamSize}
                    placeholder="Team Size"
                    className="border-2 border-gray-300 w-full px-4 py-2 rounded-md"
                    onChange={(e) => setTeamSize(e.target.value)}
                  />

                  <input
                    type="text"
                    value={venue}
                    placeholder="Venue"
                    className="border-2 border-gray-300 w-full px-4 py-2 rounded-md"
                    onChange={(e) => setVenue(e.target.value)}
                  />

                  <input
                    type="date"
                    value={eventDate}
                    className="border-2 border-gray-300 w-full px-4 py-2 rounded-md"
                    onChange={(e) => setEventDate(e.target.value)}
                  />

                  <input
                    type="text"
                    value={contact}
                    placeholder="Contact Information"
                    className="border-2 border-gray-300 w-full px-4 py-2 rounded-md"
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>

                {/* Create Product Button */}
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md w-full"
                  onClick={handleCreate}
                >
                  CREATE EVENT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProduct;
