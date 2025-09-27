import React, { useState } from "react";
// Librería para distribuciones continuas (exponencial, normal, etc.)
import { randomExponential } from "d3-random"; 
// Librería para distribuciones discretas (Poisson, Binomial, etc.)
import random from "random"; 
// Librería de gráficas Recharts
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

export default function SimulacionChocolates() {
  // === ESTADOS PARA LOS PARÁMETROS DE ENTRADA ===
  const [mediaProduccion, setMediaProduccion] = useState(""); // Media de producción (horas)
  const [mediaEmpaquetado, setMediaEmpaquetado] = useState(""); // Media de empaquetado (horas)
  const [lambdaDefectos, setLambdaDefectos] = useState(""); // Defectos promedio (λ de Poisson)
  const [lotes, setLotes] = useState(""); // Número de lotes a simular
  const [resultados, setResultados] = useState(null); // Resultados globales de la simulación
  const [detalleLotes, setDetalleLotes] = useState([]); // Detalle por cada lote (tabla y gráficas)

  // === FUNCIÓN PRINCIPAL DE SIMULACIÓN ===
  const simular = () => {
    const n = parseInt(lotes); // Número de lotes a simular
    // Distribución exponencial para tiempos de producción y empaquetado
    const prodExp = randomExponential(1 / parseFloat(mediaProduccion));
    const empaqExp = randomExponential(1 / parseFloat(mediaEmpaquetado));
    // Distribución de Poisson para defectos
    const poissonDef = random.poisson(parseFloat(lambdaDefectos));

    // Acumuladores para métricas globales
    let tiempoProduccionTotal = 0;
    let tiempoEmpaquetadoTotal = 0;
    let defectuososTotales = 0;
    let tiempoSistemaTotal = 0;
    let detalle = []; // Array con resultados por lote

    // Simulación lote por lote
    for (let i = 0; i < n; i++) {
      const tProd = prodExp(); // Tiempo aleatorio de producción
      const tEmp = empaqExp(); // Tiempo aleatorio de empaquetado
      const defectos = poissonDef(); // Número de defectos

      // Acumular resultados globales
      tiempoProduccionTotal += tProd;
      tiempoEmpaquetadoTotal += tEmp;
      defectuososTotales += defectos;
      tiempoSistemaTotal += tProd + tEmp;

      // Guardar detalle del lote
      detalle.push({
        lote: i + 1,
        produccion: tProd.toFixed(2), // Tiempo de producción con 2 decimales
        empaquetado: tEmp.toFixed(2), // Tiempo de empaquetado
        total: (tProd + tEmp).toFixed(2), // Tiempo total del lote
        defectos, // Chocolates defectuosos
      });
    }

    // Guardar el detalle en estado
    setDetalleLotes(detalle);

    // Calcular métricas globales
    setResultados({
      lotesSimulados: n,
      tiempoPromedioProduccion: (tiempoProduccionTotal / n).toFixed(2),
      tiempoPromedioEmpaquetado: (tiempoEmpaquetadoTotal / n).toFixed(2),
      tiempoPromedioSistema: (tiempoSistemaTotal / n).toFixed(2),
      defectosTotales: defectuososTotales,
      promedioDefectos: (defectuososTotales / n).toFixed(2),
    });
  };

  // === FUNCIÓN PARA LIMPIAR DATOS ===
  const limpiar = () => {
    setMediaProduccion("");
    setMediaEmpaquetado("");
    setLambdaDefectos("");
    setLotes("");
    setResultados(null);
    setDetalleLotes([]);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">
        Simulación de Producción y Empaquetado de Chocolates 🍫
      </h1>

      {/* === FORMULARIO DE ENTRADA DE PARÁMETROS === */}
      <div className="flex flex-col gap-6 text-left bg-white shadow-md p-6 rounded-lg">
        {/* Media de Producción */}
        <label>
          <span className="block text-sm font-semibold text-gray-800">
            Media de Producción (horas)
          </span>
          <span className="block text-xs text-gray-600 mb-1">
            Tiempo promedio en horas que tarda un lote en producirse.
          </span>
          <input
            type="number"
            value={mediaProduccion}
            onChange={(e) => setMediaProduccion(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </label>

        {/* Media de Empaquetado */}
        <label>
          <span className="block text-sm font-semibold text-gray-800">
            Media de Empaquetado (horas)
          </span>
          <span className="block text-xs text-gray-600 mb-1">
            Tiempo promedio en horas que tarda un lote en empaquetarse.
          </span>
          <input
            type="number"
            value={mediaEmpaquetado}
            onChange={(e) => setMediaEmpaquetado(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </label>

        {/* Defectos promedio por lote */}
        <label>
          <span className="block text-sm font-semibold text-gray-800">
            Defectos promedio por lote (λ)
          </span>
          <span className="block text-xs text-gray-600 mb-1">
            Número esperado de chocolates defectuosos por lote.
          </span>
          <input
            type="number"
            value={lambdaDefectos}
            onChange={(e) => setLambdaDefectos(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </label>

        {/* Número de lotes */}
        <label>
          <span className="block text-sm font-semibold text-gray-800">
            Número de lotes a simular
          </span>
          <span className="block text-xs text-gray-600 mb-1">
            Cantidad de lotes a incluir en la simulación.
          </span>
          <input
            type="number"
            value={lotes}
            onChange={(e) => setLotes(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </label>
      </div>

      {/* === BOTONES === */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={simular}
          className="px-6 py-2 bg-blue-300 hover:bg-blue-400 rounded font-medium"
        >
          Simular
        </button>
        <button
          onClick={limpiar}
          className="px-6 py-2 bg-red-300 hover:bg-red-400 rounded font-medium"
        >
          Limpiar
        </button>
      </div>

      {/* === RESULTADOS GLOBALES === */}
      {resultados && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
          <h2 className="text-lg font-semibold text-blue-700">
            Resultados Generales
          </h2>
          <p><strong>Lotes simulados:</strong> {resultados.lotesSimulados}</p>
          <p><strong>Tiempo promedio de producción:</strong> {resultados.tiempoPromedioProduccion} h</p>
          <p><strong>Tiempo promedio de empaquetado:</strong> {resultados.tiempoPromedioEmpaquetado} h</p>
          <p><strong>Tiempo promedio total por lote:</strong> {resultados.tiempoPromedioSistema} h</p>
          <p><strong>Defectos totales:</strong> {resultados.defectosTotales}</p>
          <p><strong>Promedio de defectos por lote:</strong> {resultados.promedioDefectos}</p>
        </div>
      )}

      {/* === DETALLE POR LOTE EN TABLA === */}
      {detalleLotes.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">
            Detalle por lote
          </h2>
          <table className="table-auto border-collapse w-full text-center text-sm">
            <thead className="bg-blue-200">
              <tr>
                <th className="px-2 py-1">Lote</th>
                <th className="px-2 py-1">Producción (h)</th>
                <th className="px-2 py-1">Empaquetado (h)</th>
                <th className="px-2 py-1">Total (h)</th>
                <th className="px-2 py-1">Defectos</th>
              </tr>
            </thead>
            <tbody className="bg-blue-50">
              {detalleLotes.map((lote) => (
                <tr key={lote.lote}>
                  <td>{lote.lote}</td>
                  <td>{lote.produccion}</td>
                  <td>{lote.empaquetado}</td>
                  <td>{lote.total}</td>
                  <td>{lote.defectos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === GRÁFICAS DE RESULTADOS === */}
      {detalleLotes.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfica de tiempos */}
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-blue-700 font-semibold mb-2">
              Tiempo total por lote
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={detalleLotes}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="lote" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#8884d8"
                  name="Tiempo total (h)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de defectos */}
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-blue-700 font-semibold mb-2">
              Defectos por lote
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={detalleLotes}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="lote" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="defectos" fill="#82ca9d" name="Defectos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
