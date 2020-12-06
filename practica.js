d3.json('Practica/practica_airbnb.json')
.then((featureCollection) => {
    drawMap(featureCollection);
});

function drawMap(featureCollection) {

    var width = 800;
    var height = 800;

    var svg = d3.select('#mapid')
        .append('svg')
        .attr('width', width*2)
        .attr('height', height)
        .append('g');

    var mytooltip = d3.select('#mapid')
        .append('div')
        .attr("class", "tooltip")
        .style("position", "absolute") //Para obtener la posicion correcta sobre los circulos
        .style("pointer-events", "none") //Para evitar el flicker
        //.style("opacity", 0)
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "15px")
        .style("padding", 5);
    //1. Datos GeoJSON
    console.log(featureCollection)
    console.log(featureCollection.features)

    var center = d3.geoCentroid(featureCollection); //Encontrar la coordenada central del mapa (de la featureCollection)
    //var center_area = d3.geoCentroid(featureCollection.features[0]); //Encontrar la coordenada central de un area. (de un feature)

    //console.log(center)

    //2.Proyeccion de coordenadas [long,lat] en valores X,Y
    var projection = d3.geoMercator()
        .fitSize([width, height], featureCollection) // equivalente a  .fitExtent([[0, 0], [width, height]], featureCollection)
        //.scale(1000)
        //Si quiero centrar el mapa en otro centro que no sea el devuelto por fitSize.
        .center(center) //centrar el mapa en una long,lat determinada
        .translate([width / 2, height / 2]) //centrar el mapa en una posicion x,y determinada

    //console.log(projection([long,lat]))

    //3.Crear paths a partir de coordenadas proyectadas.
    var pathProjection = d3.geoPath().projection(projection);
    //console.log(pathProjection(featureCollection.features[0]))
    var features = featureCollection.features;

    //Estableciendo el color por precio en el mapa
    var min_price = d3.min(features, (d) => d.properties.avgprice);
    var max_price = d3.max(features, (d) => d.properties.avgprice);

   var scaleColor = d3.scaleQuantize()
        .domain([min_price,max_price])
        .range(["#BDBDFF","#B5E7D3","steelblue","blue","FF9900", "FF9901", "red"]);
        console.log(scaleColor.thresholds())

   var createdPath = svg.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('d', (d) => pathProjection(d))
        .attr("opacity", function(d, i) {
            d.opacity = 1
            return d.opacity
        })
        .attr('fill', (d) => scaleColor(d.properties.avgprice))
   

    // Creacion de la grafica
    var svg2 = d3.select('#grafica')
    .append('svg')
    .attr('width', width*2)
    .attr('height', height)
    //.attr('x', )
    //.attr('y', '0')
    .append('g')

    //Creacion del tooltip para la grafica
    var tooltip = d3.select("#grafica").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute") //Para obtener la posicion correcta sobre los circulos
    .style("pointer-events", "none") //Para evitar el flicker
    //.style("opacity", 0)
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", 5);

    

    features.forEach(element => {if (element.properties.name == 'Palacio'){
        barrio = element;
    
    

    var scaleX = d3.scaleBand()
            .domain(barrio.properties.avgbedrooms.map(function(d) {
                return d.bedrooms;
            }))
            .range([width, width*1.5])
            .padding(0.2)
    
    var scaleY = d3.scaleLinear()
            .domain([0, d3.max(barrio.properties.avgbedrooms, function(d) {
                return d.total;
            })])
            .range([(height / 2) , 50])
    
    var x_axis = d3.axisBottom(scaleX)
    var y_axis = d3.axisLeft(scaleY)
    
    svg2.append("g")
    .attr("transform", "translate(0 " + height / 2 + ")")
    .call(x_axis)
    svg2.append("g")
    .attr("transform", "translate(" + width + ", 0)")
    .call(y_axis)
    
    
    svg2.selectAll('rect')
        .data(barrio.properties.avgbedrooms)
        .enter()
        .append('rect')
        .attr('x',function(d){
            return scaleX(d.bedrooms)
            //console.log(d)
            //return scaleX(d.properties.avgbedrooms.bedrooms)
        })
        .attr('y',function(d){
            return scaleY(d.total)
           // return scaleY(d[i].toal)
        })
        .attr("width", scaleX.bandwidth())
        .attr("height", function(d) {
            return height/2 - scaleY(d.total); //Altura real de cada rectangulo.
        })
        .attr('fill', 'steelblue')
        .style('opacity', '0,5')
        .on('mouseover', function (event,d){
                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("fill", "red")
                    .attr("width", (d) => scaleX.bandwidth() * 1.25)
                    .attr('x', (d) => scaleX(d.bedrooms) -10)

                tooltip.transition()
                    .duration(500)
                    .style("left", (event.pageX + 20) + "px")
                    .style("top", (event.pageY - 30) + "px")
                    .text(`Total: ${d.total}`)
                    .style("visibility", "visible")
        })
        .on('mouseout', function (event,d){
            d3.select(this)
                .transition()
                .duration(1000)
                .attr("fill", "steelblue")
                .attr("width", (d) => scaleX.bandwidth())
                .attr('x', (d) => scaleX(d.bedrooms))
            
            tooltip.transition()
                .duration(5000)
                .style("left", (event.pageX + 20) + "px")
                .style("top", (event.pageY - 30) + "px")
                .text(`Total: ${d.total}`)
                .style("visibility", "hidden")
    })
        //Titulo de la grafica
        svg2.append('g')
            .append("text")
            .attr("x", (width + 200))             
            .attr("y", 50)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .text("Palacio");
    }});
        
     //Creacion de una leyenda que ocupe todo el width. En este caso creo una escala.
     var nblegend = 10;
     var widthRect = (width / nblegend) - 2;
     var heightRect = 10;
 
     var scaleLegend = d3.scaleLinear()
         .domain([0, nblegend])
         .range([0, width]);
 
    console.log(scaleColor.range())
    console.log(d3.schemeTableau10)
     var legend = svg.append("g")
         .selectAll("rect")
         .data(scaleColor.range())
         .enter()
         .append("rect")
         .attr("width", widthRect)
         .attr("height", heightRect)
         .attr("x", (d, i) => scaleLegend(i)) // o (i * (widthRect + 2)) //No haria falta scaleLegend
         .attr("fill", (d) => d);
 
     var text_legend = svg.append("g")
         .selectAll("text")
         .data(d3.scaleColor)
         .enter()
         .append("text")
         .attr("x", (d, i) => scaleLegend(i)) // o (i * (widthRect + 2))
         .attr("y", heightRect * 2.5)
         .text((d) => d.properties.name)
         .attr("font-size", 12)        
   
        
         
        
   




}