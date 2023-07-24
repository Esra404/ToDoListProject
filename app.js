const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const mysql = require("mysql2");
const config = require("./config");
const axios = require("axios");
const { get } = require("http");
const connection = mysql.createConnection(config.db);

connection.connect((err) => {
  if (err) {
    console.log(err);
  }

  console.log("mysql bağlantısı yapıldı");
});

app.get("/users/:id",(req,res)=>{
  const sql='select * from user where id=?';
  const params=[reg.params.id];
  db.query(sql,params,(err,results)=>{
    if(err){
      res.send(results)
    }
  })
}





)



/*
// Base URL for your server API
const baseURL = `Server çalışıyor: http://localhost:${port}/api`;

// Function to get all items from a list
async function getItemsFromList(listIndex) {
  try {
    const response = await axios.get(`${baseURL}/lists/${listIndex}/items`);
    const items = response.data;
    return items;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Function to create a new item in a list
async function createNewItem(listIndex, itemName) {
  try {
    const response = await axios.post(`${baseURL}/lists/${listIndex}/items`, {
      itemName: itemName,
    });
    const itemId = response.data.id;
    return itemId;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Function to delete an item from a list
async function deleteItemFromList(listIndex, itemIndex) {
  try {
    await axios.delete(`${baseURL}/lists/${listIndex}/items/${itemIndex}`);
    return true; // Deletion successful
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Function to update the completion status of an item
async function updateItemCompletionStatus(listIndex, itemIndex) {
  try {
    await axios.put(`${baseURL}/lists/${listIndex}/items/${itemIndex}`);
    return true; // Update successful
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Function to delete a list and its items
async function deleteList(listIndex) {
  try {
    await axios.delete(`${baseURL}/lists/${listIndex}`);
    return true; // Deletion successful
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Function to update the name of a list
async function updateListName(listIndex, newListName) {
  try {
    await axios.put(`${baseURL}/lists/${listIndex}`, {
      newListName: newListName,
    });
    return true; // Update successful
  } catch (error) {
i    console.error(error);
    return false;
  }
}

// Usage examples:
const listIndex = 1;
const itemName = "New Item"onst itemIndex = 2;
const newListName = "New List Name";

// Fetch items from a list
getItemsFromList(listIndex)
  .then(items => console.log("Items:", items))
  .catch(error => console.error("Error fetching items:", error));

// Create a new item in a list
createNewItem(listIndex, itemName)
  .then(itemId => console.log("Created item with ID:", itemId))
  .catch(error => console.error("Error creating item:", error));

// Delete an item from a list
deleteItemFromList(listIndex, itemIndex)
  .then(result => console.log("Item deletion successful:", result))
  .catch(error => console.error("Error deleting item:", error));

// Update the completion status of an item
updateItemCompletionStatus(listIndex, itemIndex)
  .then(result => console.log("Item update successful:", result))
  .catch(error => console.error("Error updating item:", error));

// Delete a list and its items
deleteList(listIndex)
  .then(result => console.log("List deletion successful:", result))
  .catch(error => console.error("Error deleting list:", error));

// Update the name of a list
updateListName(listIndex, newListName)
  .then(result => console.log("List name update successful:", result))
  .catch(error => console.error("Error updating list name:", error));
*/

app.use(express.static("/login"));

app.get("/", (req, res) => {
  fs.readFile("./login.html", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Sunucu hatası");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    res.end();
  });
});

app.get("./public/index.html", (req, res) => {
  fs.readFile("index.html", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Sunucu hatası");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    res.end();
  });
});

app.post("/login", (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    const formData = new URLSearchParams(body);
    const username = formData.get("username");
    const password = formData.get("password");

    connection.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password],
      (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send("Sunucu hatası");
          return;
        }

        if (results.length > 0) {
          res.writeHead(302, { Location: "./public/index.html" });// res.writeHead(302, { Location: "/index.html" })
          res.end();
        } else {
          res.status(401).send("Hatalı kullanıcı adı veya şifre.");
        }
      }
    );
  });
});

app.post("/register", (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    const formData = new URLSearchParams(body);
    const username = formData.get("username");
    const password = formData.get("password");

    connection.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, password],
      (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send("Sunucu hatası");
          return;
        }

        res.writeHead(302, { Location: "./public/index.html" });
        res.end();
      }
    );
  });
});

app.use(express.json());

app.use(express.static("public"));

app.post("/api/lists", (req, res) => {
  const userId = req.body.userId;
  const listName = req.body.listName; // İstek gövdesinden liste adını al

  // Veritabanına yeni bir liste eklemek için gerekli sorguyu oluştur
  const query = "INSERT INTO lists (user_id, name) VALUES (?, ?)";

  connection.query(query, [userId, listName], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası" });
      return;
    }

    const listId = results.insertId; // Oluşturulan listenin kimlik bilgisini al

    res.status(201).json({ id: listId }); // Yaratılan listenin kimlik bilgisini döndür
  });
});

app.post("/api/lists/:listIndex/items", (req, res) => {
  const listIndex = req.params.listIndex; // Liste indeksini al
  const itemName = req.body.itemName; // İstek gövdesinden öğe adını al

  // Veritabanına yeni bir öğe eklemek için gerekli sorguyu oluştur
  const query = "INSERT INTO items (list_id, name, completed) VALUES (?, ?, ?)";

  connection.query(query, [listIndex, itemName, false], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası" });
      return;
    }

    const itemId = results.insertId; // Oluşturulan öğenin kimlik bilgisini al

    res.status(201).json({ id: itemId }); // Yaratılan öğenin kimlik bilgisini döndür
  });
});

app.delete("/api/lists/:listIndex/items/:itemIndex", (req, res) => {
  const listIndex = req.params.listIndex; // Liste indeksini al
  const itemIndex = req.params.itemIndex; // Öğe indeksini al

  // Veritabanından ilgili öğeyi silmek için gerekli sorguyu oluştur
  const query = "DELETE FROM items WHERE list_id = ? AND id = ?";

  connection.query(query, [listIndex, itemIndex], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası" });
      return;
    }

    res.sendStatus(204); // Başarılı yanıt gönder
  });
});

app.put("/api/lists/:listIndex/items/:itemIndex", (req, res) => {
  const listIndex = req.params.listIndex; // Liste indeksini al
  const itemIndex = req.params.itemIndex; // Öğe indeksini al

  // Veritabanında ilgili öğenin tamamlanma durumunu güncellemek için gerekli sorguyu oluştur
  const query =
    "UPDATE items SET completed = !completed WHERE list_id = ? AND id = ?";

  connection.query(query, [listIndex, itemIndex], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası" });
      return;
    }

    res.sendStatus(204); // Başarılı yanıt gönder
  });
});

app.delete("/api/lists/:listIndex", (req, res) => {
  const listIndex = req.params.listIndex; // Liste indeksini al

  // Veritabanından ilgili listeyi ve listeye ait tüm öğeleri silmek için gerekli sorguları oluştur
  const deleteItemsQuery = "DELETE FROM items WHERE list_id = ?";
  const deleteListQuery = "DELETE FROM lists WHERE id = ?";

  // Sırasıyla sorguları çalıştır
  connection.query(deleteItemsQuery, [listIndex], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası" });
      return;
    }

    connection.query(deleteListQuery, [listIndex], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Sunucu hatası" });
        return;
      }

      res.sendStatus(204); // Başarılı yanıt gönder
    });
  });
});

app.put("/api/lists/:listIndex", (req, res) => {
  const listIndex = req.params.listIndex; // Liste indeksini al
  const newListName = req.body.newListName; // Yeni liste adını al

  // Veritabanında ilgili listenin adını güncellemek için gerekli sorguyu oluştur
  const query = "UPDATE lists SET name = ? WHERE id = ?";

  connection.query(query, [newListName, listIndex], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası" });
      return;
    }

    res.sendStatus(204); // Başarılı yanıt gönder
  });
});

app.listen(port, () => {
  console.log(`Server çalışıyor: http://localhost:${port}`);
});