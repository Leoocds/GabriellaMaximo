const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err);
    return;
  }
  console.log("✅ Conectado ao banco de dados MySQL");
});

const servicos = {
  cabelo: [
    "Corte e Escova",
    "Coloração Premium",
    "Hidratação Profunda",
    "Tratamento Capilar",
  ],
  unha: ["Manicure Completa", "Pedicure SPA", "Unhas em Gel", "Nail Art"],
  cilios: [
    "Volume Brasileiro",
    "Volume Egípcio",
    "Volume Glamour",
    "Volume Luxo",
    "Volume Russo",
    "Fox Eyes",
    "Manutenção",
  ],
};

app.get("/", (req, res) => {
  const success = req.query.success;
  const error = req.query.error;
  res.render("index", { servicos, success, error });
});

app.post("/agendar", (req, res) => {
  const { nome, celular, tipo_servico, servico, data, hora } = req.body;

  if (!nome || !celular || !tipo_servico || !servico || !data || !hora) {
    return res.json({
      success: false,
      message: "Preencha todos os campos corretamente.",
    });
  }

  const sql = `
    INSERT INTO agendamentos (nome, telefone, tipo_servico, servico, data, hora)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [nome, celular, tipo_servico, servico, data, hora], (err) => {
    if (err) {
      console.error("Erro ao salvar agendamento:", err);
      return res.redirect("/?error=Erro ao salvar o agendamento");
    }

    console.log("🗓️ Novo agendamento salvo:", nome, servico, data, hora);
    res.json({ success: true, message: "Agendamento confirmado com sucesso!" });
  });
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
);
