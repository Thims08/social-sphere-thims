import eventModel from "../models/eventModel.js";
import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";

export const createProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category,club,team_size, venue, event_date, contact } = req.fields;

    const { photo } = req.files;
    console.log(req.files);
    //alidation
    switch (true) {
        case !name:
          return res.status(500).send({ error: "Name is Required" });
        case !description:
          return res.status(500).send({ error: "Description is Required" });
        case !price:
          return res.status(500).send({ error: "Price is Required" });
        case !category:
          return res.status(500).send({ error: "Category is Required" });
        case !club:
          return res.status(500).send({ error: "Club is Required" });
        case !team_size:
          return res.status(500).send({ error: "Team size is Required" });
        case !venue:
          return res.status(500).send({ error: "Venue is Required" });
        case !event_date:
          return res.status(500).send({ error: "Event date is Required" });
        case !contact:
          return res.status(500).send({ error: "Contact information is Required" });
        case photo && photo.size > 1000000:
          return res
            .status(500)
            .send({ error: "Photo is Required and should be less than 1MB" });
      }

    const products = new eventModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in crearing product",
    });
  }
};
export const getProductController = async (req, res) => {
    try {
      const products = await eventModel
        .find({})
        .populate("category")
        .select("-photo")
        .limit(12)
        .sort({ createdAt: -1 });
      res.status(200).send({
        success: true,
        counTotal: products.length,
        message: "ALlProducts ",
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Erorr in getting products",
        error: error.message,
      });
    }
  };
  export const getSingleProductController = async (req, res) => {
    try {
      const product = await eventModel
        .findOne({ slug: req.params.slug })
        .select("-photo")
        .populate("category")
        .populate("club");
      res.status(200).send({
        success: true,
        message: "Single Product Fetched",
        product,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Eror while getitng single product",
        error,
      });
    }
  };
  export const productPhotoController = async (req, res) => {
    try {
      const product = await eventModel.findById(req.params.pid).select("photo");
      if (product.photo.data) {
        res.set("Content-type", product.photo.contentType);
        return res.status(200).send(product.photo.data);
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Erorr while getting photo",
        error,
      });
    }
  };
  export const deleteProductController = async (req, res) => {
    try {
      await eventModel.findByIdAndDelete(req.params.pid).select("-photo");
      res.status(200).send({
        success: true,
        message: "Product Deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error while deleting product",
        error,
      });
    }
  };
  export const updateProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category,team_size, venue, event_date, contact } = req.fields;

        const { photo } = req.files;
        console.log(req.files);
        //alidation
        switch (true) {
            case !name:
              return res.status(500).send({ error: "Name is Required" });
            case !description:
              return res.status(500).send({ error: "Description is Required" });
            case !price:
              return res.status(500).send({ error: "Price is Required" });
            case !category:
              return res.status(500).send({ error: "Category is Required" });
            case !team_size:
              return res.status(500).send({ error: "Team size is Required" });
            case !venue:
              return res.status(500).send({ error: "Venue is Required" });
            case !event_date:
              return res.status(500).send({ error: "Event date is Required" });
            case !contact:
              return res.status(500).send({ error: "Contact information is Required" });
            case photo && photo.size > 1000000:
              return res
                .status(500)
                .send({ error: "Photo is Required and should be less than 1MB" });
          }
  
      const products = await eventModel.findByIdAndUpdate(
        req.params.pid,
        { ...req.fields, slug: slugify(name) },
        { new: true }
      );
      if (photo) {
        products.photo.data = fs.readFileSync(photo.path);
        products.photo.contentType = photo.type;
      }
      await products.save();
      res.status(201).send({
        success: true,
        message: "Product Updated Successfully",
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error in Updte product",
      });
    }
  };

// filters
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 2;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};
//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};