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
// //user ıd çekme
// app.get("/users/:id",(req,res)=>{
//   const sql='select * from user where id=?';
//   const params=[reg.params.id];
//   db.query(sql,params,(err,results)=>{
//     if(err){
//       res.send(results)
//     }
//   })
// })

// //yeni liste, veri ekleme
// app.post("/users", (reg, res)=>{
//   const reqBody =reg.query;
//   const sql='insert into users values (null,?,?,?)';
//   const params =[reqBody.user_id,reqBody.listId,reqBody.listName];
//   db.query(sql, params, (err,result)=>{
//     if(err){
//       res.send(err);
//     } else{
//       res.send(
//         {
//           status:'200',
//           messagder:'user added'
//         }
//       )
//     }
//   })
// })

//güncelleme
app.put("/users", (reg,res)=>{
  const regBody = reg.query;
  const sql = 'update users  set username= ? where id=?';
  const params =[ regBody.listName,regBody.listId];
  db.query(sql,params,(err,result)=> {
    if(err){
      res.send(err);
    }else{
      res.send({
        status: '200',
        message:'success updated'
      })
    }
  })
})

//silme
app.delete("/users", (req,res)=> {
  const regBody=req.query;
  const sql = 'Delete from users where id =?';
  const params =[reqBody.listId];
  db.query(sql,params,(err, result)=>{
    if(err){
      res.send({
        status:'200',
        message:'succsess delete'

      })
    }
  })
})




app.use(express.static("/login"));

app.get("/", (req, res) => {
  fs.readFile("login.html", (err, data) => {
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

app.get("/public/index.html", (req, res) => {
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
          res.writeHead(302, { Location: "/index.html" });
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

        res.writeHead(302, { Location: "/index.html" });
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