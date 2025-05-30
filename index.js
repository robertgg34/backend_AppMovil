const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const apiKey = "2afb928f1ab573a6ffda0ac21ec7b16a"; // API key reutilizable

// 🔹 Endpoint actual de clima actual
app.get("/api/clima", async (req, res) => {
  const ciudad = req.query.ciudad;

  if (!ciudad) {
    return res.status(400).json({ error: "Parámetro 'ciudad' requerido" });
  }

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        q: ciudad,
        appid: apiKey,
        units: "metric",
        lang: "es"
      }
    });

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

// 🔹 Nuevo endpoint de pronóstico a 5 días
app.get("/api/pronostico", async (req, res) => {
  const ciudad = req.query.ciudad;

  if (!ciudad) {
    return res.status(400).json({ error: "Parámetro 'ciudad' requerido" });
  }

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
      params: {
        q: ciudad,
        appid: apiKey,
        units: "metric",
        lang: "es"
      }
    });

    const datos = response.data.list;

    const resumenPorDia = {};

    datos.forEach(item => {
      const fecha = item.dt_txt.split(" ")[0];
      if (!resumenPorDia[fecha]) {
        resumenPorDia[fecha] = {
          temp: [],
          clima: item.weather[0].main,
        };
      }
      resumenPorDia[fecha].temp.push(item.main.temp);
    });

    const resultado = Object.keys(resumenPorDia).slice(0, 5).map(fecha => {
      const temps = resumenPorDia[fecha].temp;
      const tempProm = (temps.reduce((a, b) => a + b, 0)) / temps.length;
      let recomendacion = "";

      if (tempProm > 28) {
        recomendacion = "Limonada o bebida fría recomendada.";
      } else if (tempProm > 18) {
        recomendacion = "Un café helado podría ser ideal.";
      } else {
        recomendacion = "Chocolate caliente recomendado.";
      }

      return {
        fecha,
        temperatura: tempProm.toFixed(1),
        clima: resumenPorDia[fecha].clima,
        recomendacion
      };
    });

    res.json({
      ciudad: response.data.city.name,
      pronostico: resultado
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el pronóstico." });
  }
});

// Ruta raíz para Render
app.get("/", (req, res) => {
  res.send("API de clima funcionando correctamente.");
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
