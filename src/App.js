import React, { useState } from "react";

export default function GeneradorPseudo() {
  // === ESTADOS PRINCIPALES ===
  const [metodo, setMetodo] = useState(null); // Guarda el método elegido ("cuadrados" o "multiplicador")
  const [seed, setSeed] = useState(""); // Semilla inicial (X₀)
  const [d, setD] = useState(""); // Número de dígitos que se tomarán en cada iteración
  const [cantidad, setCantidad] = useState(""); // Cantidad de números a generar
  const [multiplicador, setMultiplicador] = useState(""); // Constante A (para el método multiplicador)
  const [resultados, setResultados] = useState([]); // Guarda la tabla de resultados generados
  const [showModal, setShowModal] = useState(false); // Controla la visualización del modal
  const [detalles, setDetalles] = useState([]); // Resultados de las pruebas estadísticas

  // === TEXTOS EXPLICATIVOS DE LOS MÉTODOS ===
  const explicaciones = {
    cuadrados:
      "El método de Cuadrados Medios eleva al cuadrado la semilla (X₀) y toma los dígitos centrales como nueva semilla. El número pseudoaleatorio es 0.Xn+1.",
    multiplicador:
      "El método de Multiplicador Constante multiplica la semilla (X₀) por una constante (A) y toma los dígitos centrales. Así se generan valores pseudoaleatorios.",
  };

  // === ABRIR EL MODAL ===
  const abrirModal = (m) => {
    setMetodo(m);
    setShowModal(true);
    setResultados([]); // Reinicia resultados previos
    setDetalles([]); // Limpia pruebas estadísticas
    setSeed("");
    setD("");
    setCantidad("");
    setMultiplicador("");
  };

  // === AL PRESIONAR "GENERAR" ===
  const generar = () => {
    let Xi = parseInt(seed);
    let D = parseInt(d);
    let n = parseInt(cantidad);
    let res = []; // Resultados paso a paso (tabla)
    let numeros = []; // Lista de ri (números pseudoaleatorios en [0,1])

    // Método de Cuadrados Medios
    if (metodo === "cuadrados") {
      for (let i = 0; i < n; i++) {
        let Yi = (Xi ** 2).toString(); // Elevar al cuadrado
        let len = Yi.length;
        let start = Math.floor((len - D) / 2); // Seleccionar dígitos centrales
        let Xi1 = Yi.substr(start, D);
        let ri = parseFloat("0." + Xi1); // Convertir a número en [0,1]
        res.push({ n: i, Xi, Yi, Xi1, ri });
        numeros.push(ri);
        Xi = parseInt(Xi1, 10);
      }
    }

    // Método de Multiplicador Constante
    else if (metodo === "multiplicador") {
      let A = parseInt(multiplicador);
      for (let i = 0; i < n; i++) {
        let Yi = (Xi * A).toString(); // Multiplicar por constante
        let len = Yi.length;
        let start = Math.floor((len - D) / 2);
        let Xi1 = Yi.substr(start, D);
        let ri = parseFloat("0." + Xi1);
        res.push({ n: i, Xi, Yi, Xi1, ri });
        numeros.push(ri);
        Xi = parseInt(Xi1, 10);
      }
    }

    setResultados(res);
    ejecutarPruebas(numeros); // Ejecuta las pruebas estadísticas
    setShowModal(false); // Cierra modal
  };

  // === TODAS LAS PRUEBAS ESTADÍSTICAS ===
  const ejecutarPruebas = (nums) => {
    let resultados = [];

    // --- Prueba de Media ---
    const media = nums.reduce((a, b) => a + b, 0) / nums.length;
    resultados.push({
      titulo: "Prueba de Media",
      calculos: `📊 Media obtenida = ${media.toFixed(
        4
      )}, rango aceptable [0.45, 0.55]`,
      decision: media >= 0.45 && media <= 0.55 ? "✅ Aprobada" : "❌ Rechazada",
      explicacion:
        "ℹ️ Verifica que los números estén centrados alrededor de 0.5, lo esperado en una distribución uniforme en [0,1].",
    });

    // --- Prueba de Varianza ---
    const mediaVar = media;
    const varianza =
      nums.reduce((a, b) => a + (b - mediaVar) ** 2, 0) / (nums.length - 1);
    const esperadoVar = 1 / 12; // Varianza teórica ≈ 0.0833
    resultados.push({
      titulo: "Prueba de Varianza",
      calculos: `📊 Varianza obtenida = ${varianza.toFixed(
        4
      )}, valor esperado ≈ ${esperadoVar.toFixed(4)}`,
      decision:
        varianza >= esperadoVar - 0.01 && varianza <= esperadoVar + 0.01
          ? "✅ Aprobada"
          : "❌ Rechazada",
      explicacion:
        "ℹ️ Evalúa si la dispersión de los números coincide con la varianza teórica de una distribución uniforme.",
    });

    // --- Prueba de Uniformidad (Chi² con 6 intervalos) ---
    let intervalos = Array(6).fill(0);
    nums.forEach((x) => {
      let idx = Math.min(5, Math.floor(x * 6));
      intervalos[idx]++;
    });
    const esperadoUni = nums.length / 6;
    const chi2 = intervalos.reduce(
      (sum, obs) => sum + (obs - esperadoUni) ** 2 / esperadoUni,
      0
    );
    resultados.push({
      titulo: "Prueba de Uniformidad (Chi² con 5 g.l.)",
      calculos: `📊 Frecuencias observadas = [${intervalos.join(
        ", "
      )}], valor χ² = ${chi2.toFixed(4)}, valor crítico = 11.07`,
      decision: chi2 < 11.07 ? "✅ Aprobada" : "❌ Rechazada",
      explicacion:
        "ℹ️ Revisa si los números se distribuyen de manera uniforme en intervalos. Se usa Chi² para comparar frecuencias observadas contra esperadas.",
    });

    // --- Prueba de Independencia (Corridas) ---
    let corridas = 1;
    for (let i = 1; i < nums.length; i++) {
      if ((nums[i] > media) !== (nums[i - 1] > media)) corridas++;
    }
    const esperadoCorr = (2 * nums.length - 1) / 3;
    resultados.push({
      titulo: "Prueba de Independencia (Corridas)",
      calculos: `📊 Número de corridas = ${corridas}, valor esperado ≈ ${esperadoCorr.toFixed(
        2
      )}, rango aceptable [${(esperadoCorr * 0.8).toFixed(
        2
      )}, ${(esperadoCorr * 1.2).toFixed(2)}]`,
      decision:
        corridas >= esperadoCorr * 0.8 && corridas <= esperadoCorr * 1.2
          ? "✅ Aprobada"
          : "❌ Rechazada",
      explicacion:
        "ℹ️ Comprueba si los números se distribuyen aleatoriamente alrededor de la media, midiendo las 'corridas' (secuencias por encima o debajo).",
    });

    setDetalles(resultados);
  };

  // === RENDER ===
  return (
    <div className="p-6 max-w-4xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">
        Generador Pseudoaleatorio
      </h1>

      {/* Botones para elegir método */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => abrirModal("cuadrados")}
          className="bg-blue-200 hover:bg-blue-300 px-5 py-2 rounded-lg font-medium"
        >
          Cuadrados Medios
        </button>
        <button
          onClick={() => abrirModal("multiplicador")}
          className="bg-blue-200 hover:bg-blue-300 px-5 py-2 rounded-lg font-medium"
        >
          Multiplicador Constante
        </button>
      </div>

      {/* Modal con formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-md w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-2 text-blue-700">
              {metodo === "cuadrados"
                ? "Método de Cuadrados Medios"
                : "Método de Multiplicador Constante"}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {explicaciones[metodo]}
            </p>

            {/* Inputs */}
            <div className="flex flex-col gap-3 text-left">
              <label>
                <span className="block text-sm text-gray-700">Semilla (X₀)</span>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </label>
              <label>
                <span className="block text-sm text-gray-700">Dígitos (D)</span>
                <input
                  type="number"
                  value={d}
                  onChange={(e) => setD(e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </label>
              <label>
                <span className="block text-sm text-gray-700">
                  Números a generar
                </span>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </label>
              {metodo === "multiplicador" && (
                <label>
                  <span className="block text-sm text-gray-700">
                    Constante (A)
                  </span>
                  <input
                    type="number"
                    value={multiplicador}
                    onChange={(e) => setMultiplicador(e.target.value)}
                    className="border rounded p-2 w-full"
                  />
                </label>
              )}
            </div>

            {/* Botones del modal */}
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={generar}
                className="px-4 py-2 rounded bg-blue-300 hover:bg-blue-400 font-medium"
              >
                Generar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de resultados de los métodos */}
      {resultados.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="table-auto border-collapse w-full text-center">
            <thead className="bg-blue-200">
              <tr>
                <th className="px-2 py-1">n</th>
                <th className="px-2 py-1">Xn</th>
                <th className="px-2 py-1">
                  {metodo === "cuadrados" ? "Yn = Xn²" : "Yn = Xn * A"}
                </th>
                <th className="px-2 py-1">Xn+1</th>
                <th className="px-2 py-1">rn = 0.Xn+1</th>
              </tr>
            </thead>
            <tbody className="bg-blue-50">
              {resultados.map((r, idx) => (
                <tr key={idx} className="hover:bg-blue-100">
                  <td className="px-2 py-1">{r.n}</td>
                  <td className="px-2 py-1">{r.Xi}</td>
                  <td className="px-2 py-1">{r.Yi}</td>
                  <td className="px-2 py-1">{r.Xi1}</td>
                  <td className="px-2 py-1">{r.ri}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resultados de pruebas estadísticas */}
      {detalles.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
          <h3 className="text-lg font-semibold text-blue-700">
            Resultados de las pruebas estadísticas
          </h3>
          {detalles.map((p, idx) => (
            <div key={idx} className="mt-4 border-b border-blue-200 pb-2">
              <p className="font-semibold">{p.titulo}</p>
              <p>{p.calculos}</p>
              <p className="mt-1 text-lg">{p.decision}</p>
              <p className="text-gray-700 text-sm mt-1">{p.explicacion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
