import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import axios from "axios";
import {
  getBorderColor,
  notifyError,
  notifySuccess,
} from "../../../Utils/helpers";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import client from "../../../Utils/client";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const Food = ({ onClose, foodToEdit, isEditing, refresh }) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, touchedFields },
  } = useForm();

  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState([]);
  const [foods, setFoods] = useState([]);

  const fetchFoods = () => {
    axios
      .get(`${process.env.REACT_APP_API_LINK}/foods`)
      .then((response) => {
        setFoods(response);
      })
      .catch((error) => {
        notifyError("Error Fetching Categories");
        console.error("Error fetching Categories: ", error);
      });
  };

  const fetchFoodCategories = () => {
    client
      .get(`/categories`)
      .then((response) => {
        const formattedCategories = response.data.map((category) => ({
          value: category._id,
          label: category.name,
        }));
        setCategories(formattedCategories);
      })
      .catch((error) => {
        notifyError("Error Fetching Categories");
        console.error("Error fetching Categories: ", error);
      });
  };

  useEffect(() => {
    fetchFoodCategories();
    fetchFoods();
  }, []);

  useEffect(() => {
    console.log("Categories:", categories);
    console.log("Food to Edit:", foodToEdit);
    if (isEditing && foodToEdit) {
      reset({
        name: foodToEdit.name,
        description: foodToEdit.description,
        price: foodToEdit.price,
        category: categories.find(
          (category) => category.value === foodToEdit.category
        ),
        availability: options.find(
          (option) => option.value === foodToEdit.status
        ),
        image: foodToEdit.images.url || [],
        quantity: foodToEdit.quantity,
      });
    } else {
      reset({
        name: "",
        quantity: "",
        price: "",
        category: null,
        availability: null,
        image: [],
      });
    }
  }, [isEditing, foodToEdit, categories, reset]);

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", data.price);
    formData.append("description", data.description);
    formData.append("quantity", data.quantity);
    formData.append("availability", data.availability.value);
    formData.append("category", data.category.value);

    if (data.image && data.image.length > 0) {
      data.image.forEach((file) => formData.append("images", file));
    }

    const url = isEditing ? `/foods/${foodToEdit._id}` : `/foods`;
    const method = isEditing ? "PUT" : "POST";

    client({
      method,
      url,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    })
      .then((response) => {
        refresh();
        notifySuccess(
          isEditing ? "Food updated successfully" : "Food created successfully"
        );
        onClose();
      })
      .catch((error) => {
        notifyError(isEditing ? "Error updating food" : "Error creating food");
        console.error(
          isEditing ? "Error updating food:" : "Error creating food:",
          error.response ? error.response.data : error.message
        );
      });
  };

  const options = [
    { value: "available", label: "Available" },
    { value: "unavailable", label: "Unavailable" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Edit Food" : "Add Food"}
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          id="food-form"
        >
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${getBorderColor(
                "name",
                errors,
                touchedFields
              )}`}
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700 mb-2">
              Category
            </label>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <Select
                  id="category"
                  options={categories}
                  placeholder="Select Category"
                  isClearable
                  isSearchable
                  {...field}
                  onChange={(selectedOption) => field.onChange(selectedOption)}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: errors.category ? "red" : base.borderColor,
                      "&:hover": {
                        borderColor: errors.category ? "red" : base.borderColor,
                      },
                    }),
                  }}
                />
              )}
            />
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">
                {errors.category.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-gray-700 mb-2">
              Price
            </label>
            <input
              id="price"
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${getBorderColor(
                "price",
                errors,
                touchedFields
              )}`}
              {...register("price", { required: "Price is required" })}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">
                {errors.price.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={1}
              id="description"
              className={`w-full px-3 py-2 border rounded-md ${getBorderColor(
                "description",
                errors,
                touchedFields
              )}`}
              {...register("description", {
                required: "Description is required",
              })}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="mb-4 ">
            <label htmlFor="quantity" className="block text-gray-700 mb-2">
              Quantity
            </label>
            <input
              id="quantity"
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${getBorderColor(
                "quantity",
                errors,
                touchedFields
              )}`}
              {...register("quantity", { required: "Quantity is required" })}
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.quantity.message}
              </p>
            )}
          </div>
          <div className="mb-4  mx-auto w-96">
            <label htmlFor="availability" className="block text-gray-700 mb-2">
              Availability
            </label>
            <Controller
              name="availability"
              control={control}
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <Select
                  id="availability"
                  options={options}
                  placeholder="Select availability"
                  isClearable
                  isSearchable
                  {...field}
                  onChange={(selectedOption) => field.onChange(selectedOption)}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: errors.availability
                        ? "red"
                        : base.borderColor,
                      "&:hover": {
                        borderColor: errors.availability
                          ? "red"
                          : base.borderColor,
                      },
                    }),
                  }}
                />
              )}
            />
            {errors.availability && (
              <p className="text-red-500 text-sm mt-1">
                {errors.availability.message}
              </p>
            )}
          </div>
          {/* Image filepond */}
          <div className="mb-4 col-span-2">
            <label className="block text-gray-700 mb-2">Image</label>
            <Controller
              name="image"
              rules={{ required: "Image is required" }}
              control={control}
              render={({ field }) => (
                <FilePond
                  {...field}
                  files={field.value || []}
                  onupdatefiles={(fileItems) => {
                    field.onChange(fileItems.map((fileItem) => fileItem.file));
                  }}
                  allowMultiple={true}
                  instantUpload={false}
                  acceptedFileTypes={["image/png", "image/jpeg", "image/jpg"]}
                  labelIdle='Drag & Drop your images or <span class="filepond--label-action">Browse</span>'
                  allowImagePreview={false}
                />
              )}
            />
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">Image is required</p>
            )}
          </div>
        </form>
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-gray-500 border border-gray-300 mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="food-form"
            className="px-4 py-2 rounded-md font-semibold border-2 text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
          >
            {isEditing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Food;
