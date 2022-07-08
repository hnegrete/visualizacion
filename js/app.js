// Selecciones
// - Filtro para Año
const metrica1 = d3.select("#filtro1")
// - Filtro para Entidad Federativa
const metrica2 = d3.select("#filtro2")
// - Elemento div para el mapa
const figura = d3.selectAll("#mapa")

// Márgenes para las gráficas
const margins = {
  top: 60,
  right: 20,
  bottom: 75,
  left: 100
}

// Formato para separador de miles en cifras numéricas
const sepMiles = d3.format(",")

// Opciones de los filtros
// - Filtro para Año
const opciones1 = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022"]
metrica1
  .selectAll("option")
  .data(opciones1)
  .enter()
  .append("option")
  .attr("value", (d) => d)
  .text((d) => d)

// - Filtro para Entidad Federativa
const catEntidades = {
  "Total": "Total", "Aguascalientes": "Ags", "Baja California": "BC", "Baja California Sur": "BCS", "Campeche": "Camp", "Chiapas": "Chis", "Chihuahua": "Chih", "Ciudad de México": "CDMX", "Coahuila": "Coah", "Colima": "Col", "Durango": "Dur", "Guanajuato": "Gto", "Guerrero": "Gro", "Hidalgo": "Hgo", "Jalisco": "Jal", "México": "EdoMex", "Michoacán": "Mich", "Morelos": "Mor", "Nayarit": "Nay", "Nuevo León": "NL", "Oaxaca": "Oax", "Puebla": "Pue", "Querétaro": "Qro", "Quintana Roo": "QRoo", "San Luis Potosí": "SLP", "Sinaloa": "Sin", "Sonora": "Son", "Tabasco": "Tab", "Tamaulipas": "Tamps", "Tlaxcala": "Tlax", "Veracruz": "Ver", "Yucatán": "Yuc", "Zacatecas": "Zac"
}
const opciones2 = Object.keys(catEntidades)
metrica2
  .selectAll("option")
  .data(opciones2)
  .enter()
  .append("option")
  .attr("value", (d) => d)
  .text((d) => d)

// ---------------------------- Gráfica horizontal ----------------------------
// Función generar gráfica de barras horizontales.
// Parámetros:
// - el        (string): Cadena de texto con el 'id' del elemento donde se incrustará la gráfica. Debe iniciar con '#', por ejemplo "#graf1".
// - filtro    (number): Número con el filtro que va a modificar la gráfica. El valor 1 es para el filtro 'Año', el valor 2 es para el filtro 'Entidad Federativa'.
// - titGraf   (string): Cadena de texto con el título que se desea incluir en la gráfica. Este texto será concatenado con el valor seleccionado en el filtro que modifica a la gráfica.
// - variable1 (string): Valor actualmente seleccionado en el filtro de 'Año', es decir, en el filtro 1.
// - variable2 (string): Valor actualmente seleccionado en el filtro de 'Entidad Federativa', es decir, en el filtro 2.

const drawHorizontal = async (el, filtro, titGraf, variable1 = "2015", variable2 = "Total") => {
  // Seleccionar el elemento el parámetro 'el'
  const graf = d3.selectAll(el)

  // Dimensiones totales del elemento 'el'
  const anchoTotal = +graf.style("width").slice(0,-2)
  const altoTotal = anchoTotal //(anchoTotal * 9) / 16

  // Dimensiones donde se incrustarán las barras
  const ancho = anchoTotal - margins.left - margins.right
  const alto = altoTotal - margins.top - margins.bottom

  // Eliminar los elementos 'svg' antes de generar la gráfica
  d3.select(el).selectAll("svg").remove();

  // Elementos gráficos (layers) en todo el elemento 'el'
  const svg = graf
    .append("svg")
    .attr("width", anchoTotal)
    .attr("height", altoTotal)
    .attr("class", "graf")

  // Elementos gráficos (layers) donde se incrustarán las barras
  const layer = svg
    .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)

  layer.append("rect").attr("height", alto).attr("width", ancho).attr("fill", "white")

  // Grupo con la gráfica principal
  const g = svg
    .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)

  // Grupo con la fuente de la gráfica
  const fuente = svg
  .append("g")
  .attr("transform", `translate(${margins.left/2}, ${altoTotal - 10})`)
  .append("text")
  .attr("x", 0)
  .attr("y", 0)
  .classed("fuente", true)
  .text("Fuente: SESNSP. Incidencia delictiva, 2015-2022.")
  
  // Carga de datos
  data = await d3.csv("data/datasetGrafica" + el.slice(-1) + ".csv", d3.autoType)
  
  // Escaladores
  // - Eje X
  const x = d3
    .scaleLinear()
    .range([0, ancho-60])
  // - Eje Y
  const y = d3
    .scaleBand()
    .range([0, alto])
    .paddingOuter(0.2)
    .paddingInner(0.1)
  
  // Paleta de colores para asignar un color para cada valor seleccionado en el filtro
  const color = d3
    .scaleOrdinal()
    .domain(opciones1)
    .range(d3.schemeCategory10)
  
  // Grupo con el título de la gráfica
  const titulo = g
    .append("text")
    .attr("x", ancho / 2)
    .attr("y", -15)
    .classed("titulo", true)
  
  // Grupo con los ejes de la gráfica
  // - Eje X
  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0, ${alto})`)
    .classed("axis", true)
  // - Eje Y
  const yAxisGroup = g
    .append("g")
    .classed("axis", true)
  
  // Filtro
  let variable = filtro == 1 ? variable1 : catEntidades[variable2]
  
  // Accesores
  // - Accessor para el eje horizontal
  const xAccessor = (d) => d[variable]
  data.sort((a, b) => xAccessor(b) - xAccessor(a))
  // - Accessor para el eje vertical
  const yAccessor = (d) => d["Variable"]
  
  // Escaladores
  // - Escalador para el eje horizontal
  x.domain([0, d3.max(data, xAccessor)])
  // - Escalador para el eje vertical
  y.domain(d3.map(data, yAccessor))
  
  // Rectángulos para las barras horizontales
  const rect = g
    .selectAll("rect")
    .data(data, yAccessor)
  rect
    .enter()
    .append("rect")
    .attr("x", (d) => x(0))
    .attr("y", (d) => y(yAccessor(d)))
    .attr("width", 0)
    .attr("height", y.bandwidth())
    .attr("fill", "green")
    .merge(rect)
    .transition()
    .duration(2500)
    //.ease(d3.easeBounce)
    .attr("x", (d) => x(0))
    .attr("y", (d) => y(yAccessor(d)))
    .attr("width", (d) => x(xAccessor(d)))
    .attr("height", y.bandwidth())
    .attr("fill", color(variable))
    .attr("fill-opacity", "0.8")
  
  // Asignar los eventos mouseover y mouseout para las barras
  d3.selectAll("rect").on("mouseover", mouseover).on("mouseout", mouseout);
  
  // Grupo con las etiquetas de valores
  const etiquetas = g.append("g")

  const et = etiquetas
    .selectAll("text")
    .data(data)
  et
    .enter()
    .append("text")
    .attr("x", (d) => x(0))
    .attr("y", (d) => y(yAccessor(d)) + y.bandwidth()*0.75)
    .merge(et)
    .transition()
    .duration(2500)
    .attr("x", (d) => x(xAccessor(d)))
    .attr("y", (d) => y(yAccessor(d)) + y.bandwidth()*0.75)
    .text((d) => sepMiles(xAccessor(d)))
  
  // Título de la gráfica
  titulo.text(titGraf + (filtro == 1 ? variable : variable2))
  
  // Generar ejes
  const xAxis = d3.axisBottom(x).ticks(8)
  const yAxis = d3.axisLeft(y)
  xAxisGroup.transition().duration(2500).call(xAxis)
  yAxisGroup.transition().duration(2500).call(yAxis)

  // Eventos al cambiar los filtros
  // - Filtro 'Año' hace llamada para actualizar el mapa y las gráficas 1 y 3
  metrica1.on("change", (e) => {
    e.preventDefault()
    drawMapa(e.target.value)
    drawVertical(el = "#graf1", filtro = 1, titGraf = "Mes de más robo, ", variable1 = e.target.value, variable2 = metrica2.property("value"))
    drawHorizontal(el = "#graf3", filtro = 1, titGraf = "Entidad más violenta, ", variable1 = e.target.value, variable2 = metrica2.property("value"))
  })
  // - Filtro 'Entidad Federativa' hace llamada para actualizar las gráficas 2 y 4
  metrica2.on("change", (e) => {
    e.preventDefault()
    drawVertical(el = "#graf2", filtro = 2, titGraf = "Año más violento, ", variable1 = metrica1.property("value"), variable2 = e.target.value)
    drawVertical(el = "#graf4", filtro = 2, titGraf = "Los 8 delitos de mayor violencia, ", variable1 = metrica1.property("value"), variable2 = e.target.value)
  })

}

// ---------------------------- Gráfica vertical ----------------------------
// Función generar gráfica de barras verticales.
// Parámetros:
// - el        (string): Cadena de texto con el 'id' del elemento donde se incrustará la gráfica. Debe iniciar con '#', por ejemplo "#graf1".
// - filtro    (number): Número con el filtro que va a modificar la gráfica. El valor 1 es para el filtro 'Año', el valor 2 es para el filtro 'Entidad Federativa'.
// - titGraf   (string): Cadena de texto con el título que se desea incluir en la gráfica. Este texto será concatenado con el valor seleccionado en el filtro que modifica a la gráfica.
// - variable1 (string): Valor actualmente seleccionado en el filtro de 'Año', es decir, en el filtro 1.
// - variable2 (string): Valor actualmente seleccionado en el filtro de 'Entidad Federativa', es decir, en el filtro 2.

const drawVertical = async (el, filtro, titGraf, variable1 = "2015", variable2 = "Total") => {
  // Seleccionar el elemento el parámetro 'el'
  const graf = d3.selectAll(el)

  // Dimensiones totales del elemento 'el'
  const anchoTotal = +graf.style("width").slice(0,-2)
  const altoTotal = (anchoTotal * 9) / 16

  // Dimensiones donde se incrustarán las barras
  const ancho = anchoTotal - margins.left - margins.right
  const alto = altoTotal - margins.top - margins.bottom

  // Eliminar los elementos 'svg' antes de generar la gráfica
  d3.select(el).selectAll("svg").remove();
  
  // Elementos gráficos (layers) en todo el elemento 'el'
  const svg = graf
    .append("svg")
    .attr("width", anchoTotal)
    .attr("height", altoTotal)
    .attr("class", "graf")

  // Elementos gráficos (layers) donde se incrustarán las barras
  const layer = svg
    .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)

  layer.append("rect").attr("height", alto).attr("width", ancho).attr("fill", "white")

  // Grupo con la gráfica principal
  const g = svg
    .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)

  // Grupo con la fuente de la gráfica
  const fuente = svg
  .append("g")
  .attr("transform", `translate(${margins.left/2}, ${altoTotal - 10})`)
  .append("text")
  .attr("x", 0)
  .attr("y", 0)
  .classed("fuente", true)
  .text("Fuente: SESNSP. Incidencia delictiva, 2015-2022.")
  
  // Carga de datos
  data = await d3.csv("data/datasetGrafica" + el.slice(-1) + ".csv", d3.autoType)
  
  // Escaladores
  // - Eje X
  const x = d3
    .scaleBand()
    .range([0, ancho])
    .paddingOuter(0.2)
    .paddingInner(0.1)
  // - Eje Y
  const y = d3
    .scaleLinear()
    .range([alto, 0])
  
  // Paleta de colores para asignar un color para cada valor seleccionado en el filtro
  const color = d3
    .scaleOrdinal()
    .domain(opciones1)
    .range(d3.schemeCategory10)
  
  // Grupo con el título de la gráfica
  const titulo = g
    .append("text")
    .attr("x", ancho / 2)
    .attr("y", -15)
    .classed("titulo", true)
  
  // Grupo con los ejes de la gráfica
  // - Eje X
  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0, ${alto})`)
    .classed("axis", true)
  // - Eje Y
  const yAxisGroup = g
    .append("g")
    .classed("axis", true)
  
  // Filtro
  let variable = filtro == 1 ? variable1 : catEntidades[variable2]

  // Accesores
  // - Accessor para el eje horizontal
  const xAccessor = (d) => d["Variable"]
  // - Accessor para el eje vertical
  const yAccessor = (d) => d[variable]
  if (el == "#graf4") {
    data.sort((a, b) => yAccessor(b) - yAccessor(a))
  }

  // Escaladores
  // - Escalador para el eje horizontal
  x.domain(d3.map(data, xAccessor))
  // - Escalador para el eje vertical
  y.domain([0, d3.max(data, yAccessor)*1.1])
  
  // Rectángulos para las barras verticales
  const rect = g
    .selectAll("rect")
    .data(data, yAccessor)
  rect
    .enter()
    .append("rect")
    .attr("x", (d) => x(xAccessor(d)))
    .attr("y", (d) => y(0))
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", "green")
    .merge(rect)
    .transition()
    .duration(2500)
    //.ease(d3.easeBounce)
    .attr("x", (d) => x(xAccessor(d)))
    .attr("y", (d) => y(yAccessor(d)))
    .attr("width", x.bandwidth())
    .attr("height", (d) => alto - y(yAccessor(d)))
    .attr("fill", color(variable))
    .attr("fill-opacity", "0.8")
  
  // Asignar los eventos mouseover y mouseout para las barras
  d3.selectAll("rect").on("mouseover", mouseover).on("mouseout", mouseout);
  
  // Grupo con las etiquetas de valores
  const etiquetas = g.append("g").classed("etiqdatos", true)

  const et = etiquetas
    .selectAll("text")
    .data(data)
  et
    .enter()
    .append("text")
    .attr("x", (d) => x(xAccessor(d)))
    .attr("y", (d) => y(0))
    .merge(et)
    .transition()
    .duration(2500)
    .attr("x", (d) => x(xAccessor(d)))
    .attr("y", (d) => y(yAccessor(d))*0.95)
    .text((d) => sepMiles(yAccessor(d)))
  
  // Título de la gráfica
  titulo.text(titGraf + (filtro == 1 ? variable : variable2))
  
  // Generar ejes
  const xAxis = d3.axisBottom(x)
  const yAxis = d3.axisLeft(y).ticks(8)
  yAxisGroup.transition().duration(2500).call(yAxis)
  // Unicamente para la gráfica 4 se rotan las etiquetas del eje X
  if (el == "#graf4") {
    xAxisGroup.transition().duration(2500).call(xAxis).selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform","rotate(-15)")
  } else{
    xAxisGroup.transition().duration(2500).call(xAxis)
  }

  // Eventos al cambiar los filtros
  // - Filtro 'Año' hace llamada para actualizar el mapa y las gráficas 1 y 3
  metrica1.on("change", (e) => {
    e.preventDefault()
    drawMapa(e.target.value)
    drawVertical(el = "#graf1", filtro = 1, titGraf = "Mes de más robo, ", variable1 = e.target.value, variable2 = metrica2.property("value"))
    drawHorizontal(el = "#graf3", filtro = 1, titGraf = "Entidad más violenta, ", variable1 = e.target.value, variable2 = metrica2.property("value"))
  })
  // - Filtro 'Entidad Federativa' hace llamada para actualizar las gráficas 2 y 4
  metrica2.on("change", (e) => {
    e.preventDefault()
    drawVertical(el = "#graf2", filtro = 2, titGraf = "Año más violento, ", variable1 = metrica1.property("value"), variable2 = e.target.value)
    drawVertical(el = "#graf4", filtro = 2, titGraf = "Los 8 delitos de mayor violencia, ", variable1 = metrica1.property("value"), variable2 = e.target.value)
  })
  
}

// ---------------------------- Mapa ----------------------------
// Función generar el mapa de la República Mexicana.
// Parámetros:
// - anio (string): Cadena de texto con el año para el cual se desea pintar el mapa, con base en la cantidad de homicidios registrados en ese año.

const drawMapa = async (anio = "2015") => {
  // Carga de datos
  const catEntidades = await d3.json("data/entidades.json")

  // Dimensiones totales del elemento con id='mapa'
  const anchoTotal = +figura.style("width").slice(0,-2)
  const altoTotal = anchoTotal * 0.8

  // Dimensiones donde se incrustará el mapa
  const ancho = anchoTotal
  const alto = altoTotal

  // Paleta de colores para asignar un color para cada Entidad Federativa con base en la cantidad de homicidios registrados
  const color = d3
    .scaleOrdinal()
    .domain(opciones1)
    .range(d3.schemeTableau10)
  
  // Eliminar los elementos 'svg' antes de generar el mapa
  d3.select("#mapa").selectAll("svg").remove();
  
  // Elementos gráficos (layers) en todo el elemento con id='mapa'
  const svg = figura
    .append("svg")
    .attr("width", anchoTotal)
    .attr("height", altoTotal)

  // Grupo donde se incrustará el mapa
  const g = svg
    .append("g")
    .attr("transform", `translate(0, 100)`)
  
  // Grupo con la fuente del mapa
  const fuente = svg
  .append("g")
  .attr("transform", `translate(${margins.left/2}, ${altoTotal - 10})`)
  .append("text")
  .attr("x", 0)
  .attr("y", 0)
  .classed("fuente", true)
  .text("Fuente: SESNSP. Incidencia delictiva, 2015-2022.")
  
  // Grupo con el título del mapa
  const titulo = g
    .append("text")
    .attr("x", ancho / 2)
    .attr("y", -50)
    .classed("titulo", true)
  
  // Elementos gráficos de cada entidad para armar el mapa completo
  const mapa = g
    .selectAll("svg")
    .data(catEntidades)
    .enter()
    .append("svg:path")
    .attr("transform", "scale(0.75)")
    .attr("fill", "#581845")
    .attr("d", (d) => d.d)
    .attr("entidad", (d) => d.entidad)
    .attr("id", (d) => d.id)
    .attr("fill", (d) => color(d[anio][0]))
    .attr("fill-opacity", "0.8")
    .attr("cantidad", (d) => sepMiles(d[anio][1]))
    .on("mouseover", function(d) {
      d3.select(this).attr("fill-opacity", "1").attr("stroke", "black").attr("stroke-width", "1")
      d3.select("#country-anio").text(d3.select(this).attr("entidad"))
      d3.select("#country-homicidio").text(d3.select(this).attr("cantidad"))
      d3.select("#tooltip")
        .style("display", "block")
        .style("top",  altoTotal*2 - margins.top + "px")
        .style("left",  anchoTotal + "px")
    })
    .on("mouseout", function(d) {
      d3.select(this).attr("fill-opacity", "0.8").attr("stroke-width", "0")
      d3.select("#tooltip").style("display", "none")
    })
    .on("click", function(d) {
      metrica2.property("value", d3.select(this).attr("entidad"))
      drawVertical(el = "#graf2", filtro = 2, titGraf = "Año más violento, ", variable1=metrica1.property("value"), variable2=d3.select(this).attr("entidad"))
      drawVertical(el = "#graf4", filtro = 2, titGraf = "Los 8 delitos de mayor violencia, ", variable1=metrica1.property("value"), variable2=d3.select(this).attr("entidad"))
    })

  // Título del mapa
  titulo.text("Tasa de homicidios por Entidad Federativa, " + anio)

}

// Generar elementos gráficos con los valores predefinidos al inicializar la visualización
drawMapa()
drawVertical(el = "#graf1", filtro = 1, titGraf = "Mes de más robo, ")
drawVertical(el = "#graf2", filtro = 2, titGraf = "Año más violento, ")
drawHorizontal(el = "#graf3", filtro = 1, titGraf = "Entidad más violenta, ")
drawVertical(el = "#graf4", filtro = 2, titGraf = "Los 8 delitos de mayor violencia, ")

// Asignar los eventos mouseover y mouseout al inicializar la visualización
d3.selectAll("rect").on("mouseover", mouseover).on("mouseout", mouseout);
// Evento mouseover para cambiar la opacidad al 100%
function mouseover(){
  d3.select(this).attr("fill-opacity", 1);
}
// Evento mouseout para cambiar la opacidad al 80%
function mouseout(){
  d3.select(this).attr("fill-opacity", 0.8);
}
