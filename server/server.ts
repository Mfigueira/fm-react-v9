import fastify from "fastify";
import path from "path";
import { fileURLToPath } from "url";
import { AsyncDatabase } from "promised-sqlite3";

interface PizzaTypeRow {
  pizza_type_id: string;
  name: string;
  category: string;
  description: string;
}

interface PizzaSizeRow {
  id: string;
  size: string;
  price: string;
}

interface OrderRow {
  order_id: number;
  date: string;
  time: string;
}

interface OrderItemRow {
  pizzaTypeId: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
  size: string;
}

interface CartItemBody {
  pizza: { id: string };
  size: string;
}

const server = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

const PORT = Number(process.env.PORT) || 3000;
const HOST = "RENDER" in process.env ? "0.0.0.0" : "localhost";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// __dirname is used for static file serving — keep it to avoid unused-variable errors
void __dirname;

const db = await AsyncDatabase.open("./pizza.sqlite");

server.addHook("preHandler", (req, res, done) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "*");

  const isPreflight = /options/i.test(req.method);
  if (isPreflight) {
    return res.send();
  }
  done();
});

server.get("/api/pizzas", async (_req, res) => {
  const pizzasPromise = db.all<PizzaTypeRow>(
    "SELECT pizza_type_id, name, category, ingredients as description FROM pizza_types",
  );
  const pizzaSizesPromise = db.all<PizzaSizeRow>(
    `SELECT pizza_type_id as id, size, price FROM pizzas`,
  );

  const [pizzas, pizzaSizes] = await Promise.all([
    pizzasPromise,
    pizzaSizesPromise,
  ]);

  const responsePizzas = pizzas.map((pizza) => {
    const sizes = pizzaSizes.reduce<Record<string, number>>((acc, current) => {
      if (current.id === pizza.pizza_type_id) {
        acc[current.size] = +current.price;
      }
      return acc;
    }, {});
    return {
      id: pizza.pizza_type_id,
      name: pizza.name,
      category: pizza.category,
      description: pizza.description,
      image: `/pizzas/${pizza.pizza_type_id}.webp`,
      sizes,
    };
  });

  res.send(responsePizzas);
});

server.get("/api/pizza-of-the-day", async (_req, res) => {
  const pizzas = await db.all<PizzaTypeRow>(
    `SELECT pizza_type_id as id, name, category, ingredients as description FROM pizza_types`,
  );

  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  const pizzaIndex = daysSinceEpoch % pizzas.length;
  const pizza = pizzas[pizzaIndex] as PizzaTypeRow & { id: string };

  const sizes = await db.all<{ size: string; price: string }>(
    `SELECT size, price FROM pizzas WHERE pizza_type_id = ?`,
    [pizza.id],
  );

  const sizeObj = sizes.reduce<Record<string, number>>((acc, current) => {
    acc[current.size] = +current.price;
    return acc;
  }, {});

  res.send({
    id: pizza.id,
    name: pizza.name,
    category: pizza.category,
    description: pizza.description,
    image: `/pizzas/${pizza.id}.webp`,
    sizes: sizeObj,
  });
});

server.get("/api/orders", async (_req, res) => {
  const orders = await db.all<OrderRow>(
    "SELECT order_id, date, time FROM orders",
  );
  res.send(orders);
});

server.get<{ Querystring: { id?: string } }>("/api/order", async (req, res) => {
  const { id } = req.query;
  const orderPromise = db.get<OrderRow>(
    "SELECT order_id, date, time FROM orders WHERE order_id = ?",
    [id],
  );
  const orderItemsPromise = db.all<OrderItemRow>(
    `SELECT 
        t.pizza_type_id as pizzaTypeId, t.name, t.category, t.ingredients as description, o.quantity, p.price, o.quantity * p.price as total, p.size
      FROM order_details o
      JOIN pizzas p ON o.pizza_id = p.pizza_id
      JOIN pizza_types t ON p.pizza_type_id = t.pizza_type_id
      WHERE order_id = ?`,
    [id],
  );

  const [order, orderItemsRes] = await Promise.all([
    orderPromise,
    orderItemsPromise,
  ]);

  const orderItems = orderItemsRes.map((item) => ({
    ...item,
    image: `/pizzas/${item.pizzaTypeId}.webp`,
    quantity: +item.quantity,
    price: +item.price,
  }));

  const total = orderItems.reduce((acc, item) => acc + item.total, 0);

  res.send({
    order: { total, ...order },
    orderItems,
  });
});

server.post<{ Body: { cart: CartItemBody[] } }>(
  "/api/order",
  async (req, res) => {
    const { cart } = req.body;

    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour12: false });
    const date = now.toISOString().split("T")[0];

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      res.status(400).send({ error: "Invalid order data" });
      return;
    }

    try {
      await db.run("BEGIN TRANSACTION");

      const result = await db.run(
        "INSERT INTO orders (date, time) VALUES (?, ?)",
        [date, time],
      );
      const orderId = result.lastID;

      const mergedCart = cart.reduce<
        Record<string, { pizzaId: string; quantity: number }>
      >((acc, item) => {
        const id = item.pizza.id;
        const size = item.size.toLowerCase();
        if (!id || !size) throw new Error("Invalid item data");
        const pizzaId = `${id}_${size}`;
        if (!acc[pizzaId]) {
          acc[pizzaId] = { pizzaId, quantity: 1 };
        } else {
          acc[pizzaId].quantity += 1;
        }
        return acc;
      }, {});

      for (const item of Object.values(mergedCart)) {
        await db.run(
          "INSERT INTO order_details (order_id, pizza_id, quantity) VALUES (?, ?, ?)",
          [orderId, item.pizzaId, item.quantity],
        );
      }

      await db.run("COMMIT");
      res.send({ orderId });
    } catch (error) {
      req.log.error(error);
      await db.run("ROLLBACK");
      res.status(500).send({ error: "Failed to create order" });
    }
  },
);

server.get<{ Querystring: { page?: string } }>(
  "/api/past-orders",
  async (req, res) => {
    try {
      const page = parseInt(req.query.page ?? "1", 10) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;
      const pastOrders = await db.all<OrderRow>(
        "SELECT order_id, date, time FROM orders ORDER BY order_id DESC LIMIT 10 OFFSET ?",
        [offset],
      );
      res.send(pastOrders);
    } catch (error) {
      req.log.error(error);
      res.status(500).send({ error: "Failed to fetch past orders" });
    }
  },
);

server.get<{ Params: { order_id: string } }>(
  "/api/past-order/:order_id",
  async (req, res) => {
    const { order_id } = req.params;

    try {
      const order = await db.get<OrderRow>(
        "SELECT order_id, date, time FROM orders WHERE order_id = ?",
        [order_id],
      );

      if (!order) {
        res.status(404).send({ error: "Order not found" });
        return;
      }

      const orderItems = await db.all<OrderItemRow>(
        `SELECT 
          t.pizza_type_id as pizzaTypeId, t.name, t.category, t.ingredients as description, o.quantity, p.price, o.quantity * p.price as total, p.size
        FROM order_details o
        JOIN pizzas p ON o.pizza_id = p.pizza_id
        JOIN pizza_types t ON p.pizza_type_id = t.pizza_type_id
        WHERE order_id = ?`,
        [order_id],
      );

      const formattedOrderItems = orderItems.map((item) => ({
        ...item,
        image: `/pizzas/${item.pizzaTypeId}.webp`,
        quantity: +item.quantity,
        price: +item.price,
      }));

      const total = formattedOrderItems.reduce(
        (acc, item) => acc + item.total,
        0,
      );

      res.send({
        order: { total, ...order },
        orderItems: formattedOrderItems,
      });
    } catch (error) {
      req.log.error(error);
      res.status(500).send({ error: "Failed to fetch order" });
    }
  },
);

server.post<{ Body: { name: string; email: string; message: string } }>(
  "/api/contact",
  async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).send({ error: "All fields are required" });
      return;
    }

    req.log.info(`Contact Form Submission:
    Name: ${name}
    Email: ${email}
    Message: ${message}
  `);

    res.send({ success: "Message received" });
  },
);

const start = async () => {
  try {
    await server.listen({ host: HOST, port: PORT });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
