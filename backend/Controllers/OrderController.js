const Order = require("../Models/Order");
const Cart = require("../Models/Cart");
const User = require("../Models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const admin = require("../config/Firebase");
const Food = require("../Models/Food");

const { sendEmailOrder } = require("../utils/Mailtrap");

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ order_date: 1 })
      .populate("customer");
    res.status(200).json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get order based on userID
exports.getOrdersBasedOnUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).send("User ID is required");
    }

    const orders = await Order.find({ customer: userId })
      .populate("items.foodId", "name description price") // Populate foodId in items array
      .sort({ createdAt: 1 }) // Sort by createdAt in descending order
      .exec();
    res.status(200).json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: " + err.message);
  }
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { userId, foodItems, totalPrice, paymentMethod } = req.body;

    // Validation
    if (!userId || !foodItems || !totalPrice) {
      return res.status(400).json({ message: "Invalid order data." });
    }

    const newOrder = new Order({
      customer: userId,
      items: foodItems.map((item) => ({
        foodId: item.food._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: totalPrice,
      paymentMethod: paymentMethod,
    });

    const savedOrder = await newOrder.save();

    const user = await User.findById(userId);

    // Prepare dynamic email content
    const emailContent = `
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Transaction Details</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); width: 80%; margin: 0 auto;">
            <h2 style="color: #333; margin-bottom: 10px;">Transaction Details</h2>
            <p>Thank you for your purchase! Below are the details of your transaction:</p>

            <div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Order Status:</strong> Pending</p>
            </div>

            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Foods</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${foodItems
                  .map(
                    (item) => `
                  <tr>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${
                      item.food.name
                    } (x${item.quantity})</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">PHP ${
                      item.price * item.quantity
                    }</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr style="background-color: #f9f9f9; font-weight: bold;">
                  <td style="padding: 10px; text-align: left;">Grand Total</td>
                  <td style="padding: 10px; text-align: right;">PHP ${totalPrice}</td>
                </tr>
              </tbody>
            </table>

            <p>If you have any questions about your transaction, feel free to contact us at <a href="mailto:cinemax.inc.manila@gmail.com">cinemax.inc.manila@gmail.com</a> or call us at <a href="tel:+639123456789">+63 912 345 6789</a>.</p>
          </div>
        </body>
      </html>
    `;
    // Send email to the user
    await sendEmailOrder(user.email, "Transaction Details", emailContent);

    // Clear the user's cart after order
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({
      message: "Order created successfully and email sent.",
      order: savedOrder,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Create checkout session for stripe
exports.createCheckoutSession = async (req, res) => {
  try {
    const { order, userId } = req.body;

    // Extract line items from the order
    const lineItems = order[0].items.map((item) => {
      return {
        price_data: {
          currency: "php",
          product_data: {
            name: item.food.name,
            description: item.food.description,
            images: item.food.images.map((image) => image.url), // Use URLs from images array
          },
          unit_amount: Math.round(item.food.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      };
    });

    const orderId = order[0]._id;
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/my-orders",
      cancel_url: "http://localhost:3000/cancel-payment",
      metadata: {
        orderId,
        userId,
      },
    });

    // Send session ID to the client
    res.status(201).json({ id: session.id });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

// Webhook for checkout in stripe
exports.CheckoutCreditCard = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret =
      "whsec_933a3dbf2668e98615116cb73d92ac86410fce3833ae685d4fd39bce93af8f3a"; // Replace with your secret

    let event;

    // Validate the webhook signature
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object; // Get the session object
        const userId = session.metadata.userId;

        const cart = await Cart.findOne({ user: userId }).populate(
          "items.food"
        );

        if (!cart || cart.items.length === 0) {
          return res.status(404).send({ error: "Cart is empty or not found." });
        }

        const newOrder = new Order({
          customer: userId,
          items: cart.items.map((item) => ({
            foodId: item.food._id,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: cart.totalPrice,
          paymentMethod: "Credit Card",
          paymentStatus: "paid", // Mark as paid
          status: "Processing",
        });

        await newOrder.save();

        // Step 3: Clear the user's cart
        await Cart.deleteOne({ user: userId });

        const user = await User.findById(userId);
        const foodItems = cart.items.map((item) => ({
          name: item.food.name,
          quantity: item.quantity,
          price: item.price,
        }));
        const totalPrice = cart.totalPrice;

        const emailContent = `
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Transaction Details</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); width: 80%; margin: 0 auto;">
              <h2 style="color: #333; margin-bottom: 10px;">Transaction Details</h2>
              <p>Thank you for your purchase! Below are the details of your transaction:</p>
        
              <div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
                <p><strong>Payment Method:</strong> Credit Card </p>
                <p><strong>Order Status:</strong> Pending</p>
              </div>
        
              <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Foods</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${foodItems
                    .map(
                      (item) => `
                      <tr>
                        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${
                          item.name
                        } (x${item.quantity})</td>
                        <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">PHP ${
                          item.price * item.quantity
                        }</td>
                      </tr>
                    `
                    )
                    .join("")}
                  <tr style="background-color: #f9f9f9; font-weight: bold;">
                    <td style="padding: 10px; text-align: left;">Grand Total</td>
                    <td style="padding: 10px; text-align: right;">PHP ${totalPrice}</td>
                  </tr>
                </tbody>
              </table>
        
              <p>If you have any questions about your transaction, feel free to contact us at <a href="mailto:cinemax.inc.manila@gmail.com">cinemax.inc.manila@gmail.com</a> or call us at <a href="tel:+639123456789">+63 912 345 6789</a>.</p>
            </div>
          </body>
        </html>
        `;

        await sendEmailOrder(user.email, "Transaction Details", emailContent);

        break;
    }

    res.status(200).send({ received: true });
  } catch (err) {
    console.error("Error handling webhook:", err.message);
    res.status(500).send(`Server Error: ${err.message}`);
  }
};

// Count orders
exports.countOrder = async (req, res) => {
  try {
    const orderCount = await Order.estimatedDocumentCount();
    res.status(200).json({ count: orderCount });
  } catch (err) {
    console.error("Error in countOrder:", err);
    res.status(500).json({ error: "Failed to retrieve order count" });
  }
};

// Get single Order by ID
exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Update an order
exports.updateOrderById = async (req, res) => {
  const { orderId, status } = req.body;

  if (!status || !orderId) {
    return res.status(400).json({ msg: "Status and OrderId are required" });
  }

  // Validate status value
  const validStatuses = [
    "Pending",
    "Processing",
    "Ready to Pick up",
    "Completed",
    "Cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ msg: "Invalid status value" });
  }

  try {
    // Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    ).populate({
      path: "items.foodId", // Populate the 'food' field in the 'items' array
      select: "name price", // Include only 'name' and 'price' fields of food
    });

    if (!updatedOrder) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Retrieve user information for the order
    const user = await User.findById(updatedOrder.customer);
    if (!user) {
      return res.status(404).json({ msg: "User not found for this order" });
    }

    // Prepare dynamic email content
    const emailContent = `
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); width: 80%; margin: 0 auto;">
            <h2 style="color: #333; margin-bottom: 10px;">Order Update</h2>
            <p>Your order status has been updated. Here are the details:</p>

            <div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
              <p><strong>Order ID:</strong> ${updatedOrder._id}</p>
              <p><strong>Updated Status:</strong> ${status}</p>
            </div>

            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Foods</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${updatedOrder.items
                  .map(
                    (item) => `
                  <tr>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${
                      item.foodId.name
                    } (x${item.quantity})</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">PHP ${
                      item.price * item.quantity
                    }</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr style="background-color: #f9f9f9; font-weight: bold;">
                  <td style="padding: 10px; text-align: left;">Grand Total</td>
                  <td style="padding: 10px; text-align: right;">PHP ${
                    updatedOrder.totalAmount
                  }</td>
                </tr>
              </tbody>
            </table>

            <p>If you have any questions, feel free to contact us at <a href="mailto:cinemax.inc.manila@gmail.com">cinemax.inc.manila@gmail.com</a> or call us at <a href="tel:+639123456789">+63 912 345 6789</a>.</p>
          </div>
        </body>
      </html>
    `;

    // Send email to the user
    await sendEmailOrder(user.email, "Order Update", emailContent);

    if (user.token) {
      const message = {
        notification: {
          title: `Order ${orderId}`,
          body: `Your order is now ${status}.`,
        },
        token: user.token, // The FCM token stored in your database
      };

      try {
        await admin.messaging().send(message);
      } catch (error) {
        console.error("Error sending FCM notification:", error);
      }
    } else {
      console.log("No FCM token available for the user.");
    }

    // Respond to the client
    return res.status(200).json({ msg: "Successfully Updated and email sent" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
};

exports.createReview = async (req, res) => {
  try {
    const { foodOrderItem, orderId, rating, reviewText } = req.body;
    const foodId = foodOrderItem._id;

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the food item is in the order
    const foodItem = order.items.find(
      (item) => item.foodId.toString() === foodId.toString()
    );
    if (!foodItem) {
      return res
        .status(400)
        .json({ message: "Food item not found in this order" });
    }

    // Check if the review already exists for this food item
    const existingReviewIndex = order.ratings.findIndex(
      (rating) => rating.foodId.toString() === foodId.toString()
    );

    if (existingReviewIndex !== -1) {
      // If the review exists, update it
      order.ratings[existingReviewIndex].rating = rating;
      order.ratings[existingReviewIndex].comment = reviewText;
    } else {
      // If the review doesn't exist, push a new one
      order.ratings.push({
        foodId: foodId,
        rating: rating,
        comment: reviewText,
      });
    }

    // Save the updated order with the review
    await order.save();

    // Update the food item's average rating and number of ratings
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Update the average rating and number of ratings
    food.numberOfRatings = order.ratings.filter(
      (review) => review.foodId.toString() === foodId.toString()
    ).length;
    food.averageRating =
      order.ratings
        .filter((review) => review.foodId.toString() === foodId.toString())
        .reduce((acc, review) => acc + review.rating, 0) / food.numberOfRatings;

    // Save the updated food document
    await food.save();

    return res.status(200).json({ message: "Review submitted successfully" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
};

// Get all reviews based on foodId
exports.getReviewaBasedonFoodId = async (req, res) => {
  try {
    const { id } = req.params;
    // Find all orders that have the given foodId in their ratings
    const orders = await Order.find({
      "ratings.foodId": id, // Filter orders where foodId is in ratings
    })
      .select("ratings customer")
      .populate("customer"); // Only select the ratings field

    // Extract reviews for the specific foodId
    const reviews = [];
    orders.forEach((order) => {
      order.ratings.forEach((rating) => {
        if (rating.foodId.toString() === id) {
          reviews.push({
            rating: rating.rating,
            comment: rating.comment,
            name: order.customer.fname + " " + order.customer.lname,
            profilePicUrl: order.customer.profile.url,
            _id: order.customer._id,
            orderid: order._id,
            foodId: rating.foodId,
          });
        }
      });
    });

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this food." });
    }

    // Return the reviews in the response
    res.status(200).json({ reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { orderId, foodId, newComment, newRating } = req.body;

    // Validate required fields
    if (!orderId || !foodId || !newRating) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Find the order by ID
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Check if the food item exists in the order
    const foodExists = order.items.some(
      (item) => item.foodId.toString() === foodId
    );

    if (!foodExists) {
      return res.status(404).json({ msg: "Food item not found in the order" });
    }

    // Find the existing rating for the food item
    const existingRating = order.ratings.find(
      (rating) => rating.foodId.toString() === foodId
    );

    if (existingRating) {
      // Update the existing rating and comment
      existingRating.rating = newRating;
      existingRating.comment = newComment || existingRating.comment;
    } else {
      // Add a new rating for the food item
      order.ratings.push({
        foodId,
        rating: newRating,
        comment: newComment || "",
      });
    }

    // Save the updated order
    await order.save();

    return res.status(200).json({ msg: "Review updated successfully", order });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { orderId, foodId } = req.body;

    // Find the order by orderId
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Find the rating for the specific foodId within the order's ratings
    const reviewIndex = order.ratings.findIndex(
      (review) => review.foodId.toString() === foodId.toString()
    );

    if (reviewIndex === -1) {
      return res
        .status(404)
        .json({ msg: "Review not found for this food item" });
    }

    // Remove the review
    order.ratings.splice(reviewIndex, 1);

    // Save the updated order
    await order.save();
    return res.status(200).json({ msg: "Review deleted successfully" });
  } catch (error) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
};
