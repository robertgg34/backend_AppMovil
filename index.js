const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/api/clima", async (req, res) => {
  const ciudad = req.query.ciudad;
  const apiKey = "2afb928f1ab573a6ffda0ac21ec7b16a"; // Reemplazada con tu API

  if (!ciudad) {
    return res.status(400).json({ error: "Parámetro 'ciudad' requerido" });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: ciudad,
          appid: apiKey,
          units: "metric",
          lang: "es"
        }
      }
    );

    const data = response.data;
    const temperatura = data.main.temp;
    const clima = data.weather[0].main;

    let recomendacion = "";
    if (temperatura > 28) {
      recomendacion = "Una limonada con hielo suena perfecto.";
    } else if (temperatura > 18) {
      recomendacion = "Un café helado podría ser ideal.";
    } else {
      recomendacion = "Una taza de chocolate caliente te irá bien.";
    }

    res.json({
      ciudad: data.name,
      clima,
      temperatura,
      recomendacion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo obtener el clima" });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
