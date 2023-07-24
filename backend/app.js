const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const crypto = require("crypto");
const cors = require("cors");
const axios = require("axios");
const { Framework } = require("@superfluid-finance/sdk-core");
const { CeloProvider } = require("@celo-tools/celo-ethers-wrapper");
require("dotenv").config();
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173" }));

const provider = new CeloProvider("https://forno.celo.org");

const MONGO_URI = process.env.MONOGOURI;

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to the database successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the application on database connection failure
  }
}

connectToDatabase();

// Define Mongoose schemas
const userSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true,
    unique: true,
  },
  publishedApps: [{ type: mongoose.Schema.Types.ObjectId, ref: "App" }],
  subscribedApps: [
    {
      app: { type: mongoose.Schema.Types.ObjectId, ref: "App" },
      apiKey: { type: String, required: true },
    },
  ],
});

const appSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  returnedURL: {
    type: String,
    required: true,
    unique: true,
  },
  Owner: {
    type: String,
    required: true,
    ref: "User",
  },
  Buyers: {
    type: [String],
    required: false,
    ref: "User",
  },
});
const apiKeySchema = new mongoose.Schema({
  apiKey: {
    type: String,
    required: true,
    unique: true,
  },
  app: { type: mongoose.Schema.Types.ObjectId, ref: "App" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

// Create Mongoose models
const User = mongoose.model("User", userSchema);
const App = mongoose.model("App", appSchema);
const APIKey = mongoose.model("APIKey", apiKeySchema);


// Adding a buyer to an app and generate API key
async function addBuyerToApp(appName, buyerWallet) {
  try {
    const app = await App.findOne({ name: appName });

    if (!app) {
      console.log("App not found");
      return;
    }

    if (app.Owner === buyerWallet) {
      console.log("The buyer cannot be the same as the owner.");
    } else if (app.Buyers.includes(buyerWallet)) {
      console.log("The buyer is already a buyer of this app.");
    } else {
      // Generate a new API key for the app
      const apiKeyValue = crypto.randomBytes(7).toString("hex");
      const apiKey = new APIKey({ apiKey: apiKeyValue, app: app._id });

      await apiKey.save();

      // Add the app to user's subscribedApps
      const user = await User.findOne({ wallet: buyerWallet });
      user.subscribedApps.push({ app: app._id, apiKey: apiKeyValue });
      await user.save();

      // Add the buyer to the app's Buyers array
      app.Buyers.push(buyerWallet);
      await app.save();

      console.log(`Buyer ${buyerWallet} added to ${appName} successfully`);
    }
  } catch (error) {
    console.error("Error adding buyer to app:", error);
  }
}

async function removeBuyerFromApp(appName, buyerWallet) {
  try {
    const app = await App.findOne({ name: appName });

    if (!app) {
      console.log("App not found");
      return;
    }

    const buyerIndex = app.Buyers.indexOf(buyerWallet);
    if (buyerIndex === -1) {
      console.log("Buyer not found in the Buyers array.");
      return;
    }

    app.Buyers.splice(buyerIndex, 1);
    await app.save();
    console.log(`Buyer ${buyerWallet} removed from ${appName} successfully`);

    // Update the subscribedApps of the user
    const user = await User.findOne({ wallet: buyerWallet });
    const subscribedAppIndex = user.subscribedApps.findIndex(
      (subscribedApp) => subscribedApp.app.toString() === app._id.toString()
    );
    if (subscribedAppIndex !== -1) {
      user.subscribedApps.splice(subscribedAppIndex, 1);
      await user.save();
    }
  } catch (error) {
    console.error("Error removing buyer:", error);
  }
}

// Retrieve all owner-buyer pairs
async function getAllOwnerBuyerPairs() {
  try {
    const apps = await App.find();
    const pairsArray = [];

    apps.forEach((app) => {
      const { Owner, Buyers } = app;

      Buyers.forEach((buyer) => {
        pairsArray.push({ owner: Owner, buyer });
      });
    });

    return pairsArray;
  } catch (error) {
    console.error("Error retrieving owner-buyer pairs:", error);
    return [];
  }
}

async function createUser(wallet) {
  try {
    const newUser = new User({ wallet });
    await newUser.save();
    console.log(`User with wallet "${wallet}" created successfully`);
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

async function createApp(name, returnedURL, ownerWallet) {
  try {
    const newApp = new App({ name, returnedURL, Owner: ownerWallet });
    await newApp.save();

    // Find the owner user and update their publishedApps array
    const owner = await User.findOne({ wallet: ownerWallet });
    owner.publishedApps.push(newApp._id);
    await owner.save();

    console.log(`App "${name}" created successfully`);
  } catch (error) {
    console.error("Error creating app:", error);
  }
}

const forwardedURLs = async () => {
  const apps = await App.find();
  const returnedURLs = {};
  apps.forEach((app) => {
    returnedURLs[app.name] = app.returnedURL;
  });
  return returnedURLs;
};

const hello = async () => {
  const sf = await Framework.create({
    chainId: 42220,
    provider,
  });

  const celox = await sf.loadSuperToken("CELOx");
  console.log("celox", celox.address);

  const previousFlowInfos = {};

  const checkFlowInfo = async (sender, receiver) => {
    const flowInfo = await celox.getFlow({
      sender,
      receiver,
      providerOrSigner: provider,
    });

    const key = `${sender}-${receiver}`;
    const currentFlowRate = flowInfo.flowRate;
    if (currentFlowRate === "0") {
      const app = await App.findOne({ Owner: receiver, Buyers: sender });
      if (app) {
        console.log("app", app);
        await removeBuyerFromApp(app.name, sender);
      }
    } else {
      if (
        !previousFlowInfos[key] ||
        JSON.stringify(flowInfo) !== JSON.stringify(previousFlowInfos[key])
      ) {
        console.log("flowInfo", flowInfo);
        previousFlowInfos[key] = flowInfo;

        const app = await App.findOne({ Owner: receiver });
        if (app && !app.Buyers.includes(sender)) {
          await addBuyerToApp(app.name, sender);
          console.log("New buyer added:", sender);
        }
      }
    }
  };

  const ownerBuyerPairs = await getAllOwnerBuyerPairs();
  const senderReceiverPairs = ownerBuyerPairs.map((pair) => ({
    sender: pair.buyer,
    receiver: pair.owner,
  }));

  console.log("senderReceiverPairs", senderReceiverPairs);

  senderReceiverPairs.forEach(({ sender, receiver }) => {
    setInterval(async () => {
      await checkFlowInfo(sender, receiver);
    }, 1000);
  });
};

hello();

app.use(async (req, res, next) => {
  const keys = await User.find().populate("subscribedApps.app");
  req.apiKeys = keys;
  next();
});
function validateApiKey(req, res, next) {
  const apiKey = req.headers["api_key"];
  const host = req.headers.host;
  const subdomain = host.split(".")[0];

  const apiKeyExists = req.apiKeys.some((key) =>
    key.subscribedApps.some(
      (app) => app.apiKey === apiKey && app.app.name === subdomain
    )
  );

  if (apiKeyExists) {
    next();
  } else {
    res.status(401).send("Invalid API key.");
  }
}

const forwardRequest = async (req, res, baseURL) => {
  const apiKey = req.headers["api_key"];
  const user = req.apiKeys.find((key) =>
    key.subscribedApps.some((app) => app.apiKey === apiKey)
  );
  const app = user.subscribedApps.find((app) => app.apiKey === apiKey).app;
  console.log("app", app);
  console.log("baseURL", baseURL);
  const baseURLApp = await App.findOne({ returnedURL: baseURL });

  if (app.name !== baseURLApp.name) {
    return res.status(403).send("API key does not match app.");
  }

  try {
    const response = await axios({
      method: req.method,
      url: `${baseURL}${req.url}`,
      headers: {
        ...req.headers,
        host: new URL(baseURL).host,
      },
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).json({ error: "An error occurred" });
    }
  }
};

app.post("/", async (req, res) => {
  const { name, baseURL, owner } = req.body;

  if (!name || !baseURL || !owner) {
    return res
      .status(400)
      .json({ error: "Missing name, baseURL, or owner in the request body" });
  }

  try {
    await createApp(name, baseURL, owner);
    res.status(200).json({ url: `${name}.localhost:3000` });
  } catch (error) {
    res.status(500).json({ error: "Failed to create app" });
  }
});
app.delete("/app/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const app = await App.findById(id);

    if (!app) {
      return res.status(404).json({ error: "App not found" });
    }

    // Find all users who are subscribed to this app
    const users = await User.find({ "subscribedApps.app": id });

    // For each user, remove the app from their subscribedApps array
    for (const user of users) {
      const index = user.subscribedApps.findIndex(
        (subscribedApp) => subscribedApp.app.toString() === id
      );
      if (index !== -1) {
        user.subscribedApps.splice(index, 1);
        await user.save();
      }
    }

    // Delete the app
    await App.findByIdAndRemove(id);

    res
      .status(200)
      .json({ message: `App with id "${id}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete app" });
  }
});

app.post("/user", async (req, res) => {
  const { wallet } = req.body;

  if (!wallet) {
    return res
      .status(400)
      .json({ error: "Missing wallet in the request body" });
  }

  try {
    await createUser(wallet);
    res
      .status(200)
      .json({ message: `User with wallet "${wallet}" created successfully` });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.get("/apps", async (req, res) => {
  try {
    const apps = await App.find();
    res.status(200).json(apps);
  } catch (error) {
    res.status(500).json({ error: "Failed to get apps" });
  }
});
async function waitWithCountdown(seconds) {
  return new Promise((resolve) => {
    let remainingSeconds = seconds;
    const interval = setInterval(() => {
      console.log(`${remainingSeconds} seconds remaining...`);
      remainingSeconds--;

      if (remainingSeconds === 0) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
}
app.post("/unsubscribe", async (req, res) => {
  const { appName, wallet } = req.body;

  if (!appName || !wallet) {
    return res
      .status(400)
      .json({ error: "Missing appName or wallet in the request body" });
  }

  try {
    await removeBuyerFromApp(appName, wallet);
    res
      .status(200)
      .json({ message: `Successfully unsubscribed from ${appName}` });
  } catch (error) {
    res.status(500).json({ error: "Failed to unsubscribe from the app" });
  }
});

app.post("/buy", async (req, res) => {
  const { appName, wallet } = req.body;

  if (!appName || !wallet) {
    return res
      .status(400)
      .json({ error: "Missing appName or wallet in the request body" });
  }

  try {
    await addBuyerToApp(appName, wallet);
    console.log("Waiting for 10 seconds...");
    await waitWithCountdown(100);
    await hello();
    res.status(200).json({ message: `Successfully subscribed to ${appName}` });
  } catch (error) {
    res.status(500).json({ error: "Failed to subscribe to the app" });
  }
});

app.get("/user/:wallet/subscribedApps", async (req, res) => {
  const { wallet } = req.params;

  try {
    const user = await User.findOne({ wallet }).populate("subscribedApps.app");
    res.status(200).json(user.subscribedApps);
  } catch (error) {
    res.status(500).json({ error: "Failed to get subscribed apps" });
  }
});

app.get("/user/:wallet/publishedApps", async (req, res) => {
  const { wallet } = req.params;

  try {
    const user = await User.findOne({ wallet }).populate("publishedApps");
    res.status(200).json(user.publishedApps);
  } catch (error) {
    res.status(500).json({ error: "Failed to get published apps" });
  }
});

app.get("/user/:wallet", async (req, res) => {
  const { wallet } = req.params;

  try {
    const user = await User.findOne({ wallet });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to get users" });
  }
});

app.all(
  "*",
  async (req, res, next) => {
    const host = req.headers.host;
    const subdomain = host.split(".")[0];
    const fURLS = await forwardedURLs();
    console.log(fURLS);

    const baseURL = fURLS[subdomain];

    if (!baseURL) {
      return res
        .status(404)
        .json({ error: "Invalid subdomain or URL not found" });
    }

    // Apply the validateApiKey middleware
    validateApiKey(req, res, next);
  },
  async (req, res) => {
    const host = req.headers.host;
    const subdomain = host.split(".")[0];
    const fURLS = await forwardedURLs();

    const baseURL = fURLS[subdomain];

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        await forwardRequest(req, res, baseURL);
        return;
      } catch (error) {
        retries++;
      }
    }

    res.status(500).json({ error: "Failed to forward request" });
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
