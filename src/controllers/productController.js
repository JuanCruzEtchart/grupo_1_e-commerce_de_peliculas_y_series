const path = require("path");
const fs = require("fs");
const { validationResult } = require("express-validator");
const db = require("../database/models");
const { resolveNaptr } = require("dns");

const Product = db.Product;
const Actors = db.Actor;
const Directors = db.Director;
const Screenwriters = db.Screenwriter;
const Genres = db.Genre;
const Characters = db.Character;

/* function findAll() {
  const jsonData = fs.readFileSync(
    path.join(__dirname, "../data/products.json")
  );
  const data = JSON.parse(jsonData);
  return data;
} */

function writeFile(data) {
  const dataString = JSON.stringify(data, null, 1);
  fs.writeFileSync(path.join(__dirname, "../data/products.json"), dataString);
}

function findAllTemp() {
  const jsonData = fs.readFileSync(
    path.join(__dirname, "../data/productTemp.json")
  );
  const data = JSON.parse(jsonData);
  return data;
}

function writeFileTemp(data) {
  const dataString = JSON.stringify(data, null, 1);
  fs.writeFileSync(
    path.join(__dirname, "../data/productTemp.json"),
    dataString
  );
}

const productController = {
  //Render de vista de detalle de productos
  detailProduct: async (req, res) => {
    /*     const data = findAll();
    const directorsFilter = [];
    const similarFilter = [];

    let productFound = data.find((product) => {
      return product.id == req.params.id;
    });

    data.forEach((filtered) => {
      if (filtered.director == productFound.director) {
        directorsFilter.push(filtered);
      }
    });

    data.forEach((filtered) => {
      if (filtered.genre1 == productFound.genre1) {
        similarFilter.push(filtered);
      }
    });

    res.render("productDetail", {
      product: productFound,
      list: data,
      director: directorsFilter,
      similar: similarFilter,
    }); */
    const id = req.params.id;
    let product = await Product.findByPk(id, {
      include: [
        "director",
        "screenwriter",
        "genre1",
        "genre2",
        "actors",
        "characters",
      ],
    });
    let allProducts = await Product.findAll({
      include: [
        "director",
        "screenwriter",
        "genre1",
        "genre2",
        "actors",
        "characters",
      ],
    });
    res.render("productDetail", { product, allProducts });
  },

  //Render de vista de carga de directores, guionistas y actores
  createProductionTeam: (req, res) => {
    const directors = Directors.findAll();
    const screenwriters = Screenwriters.findAll();
    const actors = Actors.findAll();
    Promise.all([directors, screenwriters, actors])
      .then(([allDirectors, allScreenwriters, allActors]) => {
        res.render("createProductionTeam", {
          directors: allDirectors,
          screenwriters: allScreenwriters,
          actors: allActors,
        });
      })
      .catch((error) => {
        res.send(error);
      });
  },

  //Guardado de directores, guionistas y actores
  productionTeamUpload: (req, res) => {
    if (req.body.radio == "actor") {
      Actors.create({
        full_name: req.body.name,
        biography_link: req.body.biography_link,
        actors_photo: req.file.filename,
      })
        .then(() => {
          console.log("Actor creado!");
          res.redirect("/product/create/productionTeam");
        })
        .catch((error) => res.send(error));
    } else if (req.body.radio == "director") {
      Directors.create({
        full_name: req.body.name,
        biography_link: req.body.biography_link,
        directors_photo: req.file.filename,
      })
        .then(() => {
          console.log("Director creado!");
          res.redirect("/product/create/productionTeam");
        })
        .catch((error) => res.send(error));
    } else {
      Screenwriters.create({
        full_name: req.body.name,
        biography_link: req.body.biography_link,
        screenwriter_photo: req.file.filename,
      })
        .then(() => {
          console.log("Guionista creado!");
          res.redirect("/product/create/productionTeam");
        })
        .catch((error) => res.send(error));
    }
  },
  //Render de la vista de carga de personajes
  createCharacter: (req, res) => {
    Characters.findAll().then((characters) => {
      res.render("createCharacter", { characters });
    });
  },

  //Guardado de personajes
  uploadCharacter: (req, res) => {
    Characters.create({
      name: req.body.name,
    })
      .then(() => {
        console.log("Personaje creado!");
        res.redirect("/product/create/character");
      })
      .catch((error) => {
        res.send(error);
      });
  },

  //Render de vista de creación de productos
  create: async (req, res) => {
    const dataTemp = await findAllTemp();
    const genres = await Genres.findAll();
    const actors = await Actors.findAll();
    const directors = await Directors.findAll();
    const screenwriter = await Screenwriters.findAll();
    res.render("productCreate", {
      old: dataTemp,
      genres,
      actors,
      directors,
      screenwriter,
    });
  },

  //Guardado de producto temporal
  store: (req, res) => {
    const dataTemp = findAllTemp();
    const validationErrors = validationResult(req);

    const productImage = req.files.productImage.map(function (image) {
      return image.filename;
    });
    const backgroundImage = req.files.backgroundImage.map(function (image) {
      return image.filename;
    });
    console.log(req.files);
    console.log(validationErrors);

    /*     if (!validationErrors.isEmpty()) {
      res.render("productCreate", {
        errors: validationErrors.array(),
        errors2: validationErrors.mapped(),
        old: req.body,
      });
      console.log(validationErrors);
    } else {
      const newProduct = {
        type: req.body.type,
        name: req.body.name,
        release_year: req.body.release_year,
        rating: req.file.rating,
        length: req.body.length,
        imdb_score: req.body.imdbScore,
        imdb_total_reviews: req.body.imdbTotalReviews,
        tomato_score: req.body.tomatoScore,
        trailer_link: req.body.trailerLink,
        genre1_id: req.body.genre1,
        genre2_id: req.body.genre2,
        purchase_price: req.body.purchasePrice,
        rental_price: req.body.rentalPrice,
        synopsis: req.body.synopsis,
        director_id: req.body.director,
        screenwriter_id: req.body.screenwriter,
        product_image: productImage,
        background_image: backgroundImage,
      };

      writeFileTemp(newProduct);
      res.redirect("/product/create/cast");
      console.log(newProduct);
      console.log("Producto temporal creado!"); 
    } */
    const newProduct = {
      type: req.body.type,
      name: req.body.name,
      release_year: req.body.release_year,
      rating: req.body.rating,
      length: req.body.length,
      imdb_score: req.body.imdbScore,
      imdb_total_reviews: req.body.imdbTotalReviews,
      tomato_score: req.body.tomatoScore,
      trailer_link: req.body.trailerLink,
      genre1_id: req.body.genre1,
      genre2_id: req.body.genre2,
      purchase_price: req.body.purchasePrice,
      rental_price: req.body.rentalPrice,
      synopsis: req.body.synopsis,
      director_id: req.body.director,
      screenwriter_id: req.body.screenwriter,
      product_image: productImage,
      background_image: backgroundImage,
      castLength: req.body.castLength,
    };

    writeFileTemp(newProduct);
    res.redirect("/product/create/cast");
    console.log(newProduct);
    console.log("Producto temporal creado!");
    /*     if (req.body.type == "Película") {
      Movies.create({
        name: req.body.name,
        release_year: req.body.release_year,
        rating: req.file.rating,
        length: req.body.length,
        imdb_score: req.body.imdbScore,
        imdb_total_reviews: req.body.imdbTotalReviews,
        tomato_score: req.body.tomatoScore,
        trailer_link: req.body.trailerLink,
        purchase_price: req.body.purchasePrice,
        rental_price: req.body.rentalPrice,
        synopsis: req.body.synopsis,
        director_id: req.body.director,
        screenwriter_id: req.body.screenwriter,
        product_image: productImage,
        background_image: backgroundImage,
      })
        .then((movie) => {
          console.log("Película creada!");
          movie.set;
          //res.redirect("/product/create");
        })
        .catch((error) => res.send(error));
    } else {
    } */
  },

  //Render de vista de edición de productos
  edit: async (req, res) => {
    const id = req.params.id;

    const movie = await Product.findByPk(id, {
      include: [
        "director",
        "screenwriter",
        "genre1",
        "genre2",
        "actors",
        "characters",
      ],
    });
    const genres = await Genres.findAll();
    //const actors = await Actors.findAll();
    const directors = await Directors.findAll();
    const screenwriter = await Screenwriters.findAll();
    res.render("productUpdate", {
      product: movie,
      genres,
      directors,
      screenwriter,
    });
  },

  //Guardado de edición de productos
  update: (req, res) => {
    const productId = req.params.id;
    const validationErrors = validationResult(req);
    //const data = findAll();

    /*  */ /*     let productFound = data.find((product) => {
      return product.id == req.params.id;
    });

    if (!validationErrors.isEmpty()) {
      res.render("productUpdate", {
        product: productFound,
        errors: validationErrors.array(),
        errors2: validationErrors.mapped(),
      });
      console.log(validationErrors);
    } else {
      productFound.name = req.body.name;
      productFound.type = req.body.type;
      productFound.year = req.body.year;
      productFound.rated = req.body.rated;
      productFound.length = req.body.length;
      productFound.imdbScore = req.body.imdbScore;
      productFound.imdbTotalReviews = req.body.imdbTotalReviews;
      productFound.tomatoScore = req.body.tomatoScore;
      productFound.trailerLink = req.body.trailerLink;
      productFound.genre1 = req.body.genre1;
      productFound.genre2 = req.body.genre2;
      productFound.purchasePrice = req.body.purchasePrice;
      productFound.rentalPrice = req.body.rentalPrice;
      productFound.synopsis = req.body.synopsis;
      productFound.director = req.body.director;
      productFound.directorBiography = req.body.directorBiography;
      productFound.screenwriter = req.body.screenwriter;
      productFound.screenwriterBiography = req.body.screenwriterBiography;
      productFound.productImage = productImage;
      productFound.backgroundImage = backgroundImage;
      productFound.castLength = req.body.castLength;
      
      writeFile(data);
      res.redirect("/product/list");
    } */
    let product = Product.findByPk(productId);
    /*     const image =
      req.files.productImage != undefined
        ? product.product_image
        : req.files.productImage.map(function (image) {
            return image.filename.toString();
          });

    console.log("IMAGEN" + image); */

    const productImage = req.files.productImage.map(function (image) {
      return image.filename;
    });

    const backgroundImage = req.files.backgroundImage.map(function (image) {
      return image.filename;
    });

    Product.update(
      {
        type: req.body.type,
        name: req.body.name,
        release_year: req.body.release_year,
        rating: req.body.rating,
        length: req.body.length,
        imdb_score: req.body.imdbScore,
        imdb_total_reviews: req.body.imdbTotalReviews,
        tomato_score: req.body.tomatoScore,
        trailer_link: req.body.trailerLink,
        genre1_id: req.body.genre1,
        genre2_id: req.body.genre2,
        purchase_price: req.body.purchasePrice,
        rental_price: req.body.rentalPrice,
        synopsis: req.body.synopsis,
        director_id: req.body.director,
        screenwriter_id: req.body.screenwriter,
        product_image:
          req.files.productImage == undefined
            ? product.product_image
            : productImage.toString(),
        background_image:
          req.files.backgroundImage == undefined
            ? product.product_image
            : backgroundImage.toString(),
      },
      {
        where: { id: productId },
      }
    )
      .then(() => {
        console.log("Producto editado!");
        res.redirect("/product/list");
      })
      .catch((error) => {
        res.send(error);
      });
  },

  //Eliminación de productos
  destroy: async (req, res) => {
    const productId = req.params.id;

    let product = await Product.findByPk(productId);
    await product.setCharacters([]);
    await product.setActors([]);
    await Product.destroy({ where: { id: productId } });
    res.redirect("/product/list");
  },

  //Render de vista de creación de repartos
  castCreate: async (req, res) => {
    const dataTemp = await findAllTemp();
    const characters = await Characters.findAll();
    const actors = await Actors.findAll();

    res.render("productCast", { product: dataTemp, actors, characters });
  },

  //Guardado de repartos y producto final
  castUpload: (req, res) => {
    /*     const data = findAll();
    const dataTemp = findAllTemp();
    const productImage = dataTemp.productImage.map(function (image) {
      return image;
    });
    const backgroundImage = dataTemp.backgroundImage.map(function (image) {
      return image;
    });

    const actors = [];

    for (let i = 1; i <= req.body.castLength; i++) {
      const actorsPhoto = req.files.filter(function (file) {
        return file.fieldname == "actorsPhoto" + i;
      });
      const actorsPhotoFile = actorsPhoto.map(function (file) {
        return file.filename;
      });

      actors.push({
        id: i,
        actorsName: req.body["actorsName" + i],
        character: req.body["character" + i],
        actorsBiography: req.body["actorsBiography" + i],
        actorsPhoto: actorsPhotoFile,
      });
    }

    const newCast = {
      id: data.length + 1,
      name: req.body.name,
      type: req.body.type,
      year: req.body.year,
      rated: req.body.rated,
      length: req.body.length,
      imdbScore: Number(req.body.imdbScore),
      imdbTotalReviews: req.body.imdbTotalReviews,
      tomatoScore: req.body.tomatoScore,
      trailerLink: req.body.trailerLink,
      genre1: req.body.genre1,
      genre2: req.body.genre2,
      purchasePrice: Number(req.body.purchasePrice),
      rentalPrice: Number(req.body.rentalPrice),
      synopsis: req.body.synopsis,
      director: req.body.director,
      directorBiography: req.body.directorBiography,
      screenwriter: req.body.screenwriter,
      screenwriterBiography: req.body.screenwriterBiography,
      productImage: productImage,
      backgroundImage: backgroundImage,
      castLength: req.body.castLength,
      cast: actors,
    };

    data.push(newCast);
    writeFileTemp({});
    writeFile(data);
    res.redirect("/product/list"); */
    Product.create({
      type: req.body.type,
      name: req.body.name,
      release_year: req.body.release_year,
      rating: req.body.rating,
      length: req.body.length,
      imdb_score: req.body.imdb_score,
      imdb_total_reviews: req.body.imdb_total_reviews,
      tomato_score: req.body.tomato_score,
      trailer_link: req.body.trailer_link,
      genre1_id: req.body.genre1_id,
      genre2_id: req.body.genre2_id,
      purchase_price: req.body.purchase_price,
      rental_price: req.body.rental_price,
      synopsis: req.body.synopsis,
      director_id: req.body.director_id,
      screenwriter_id: req.body.screenwriter_id,
      product_image: req.body.productImage,
      background_image: req.body.backgroundImage,
    })
      .then((product) => {
        for (let i = 1; i <= req.body.castLength; i++) {
          product.setActors(req.body["actor" + i]);
          product.setCharacters(req.body["character" + i]);
        }
        writeFileTemp({});
        console.log("Producto creado!");
        res.redirect("/product/list");
      })
      .catch((error) => res.send(error));
  },

  //Render de vista de lista general de productos
  list: (req, res) => {
    Product.findAll({
      include: [
        "director",
        "screenwriter",
        "genre1",
        "genre2",
        "actors",
        "characters",
      ],
    })
      .then((products) => {
        res.render("productList", { products });
      })
      .catch((error) => {
        res.send(error);
      });
  },

  //Render de vista de lista de películas
  movies: (req, res) => {
    Product.findAll({ where: { type: "Película" } })
      .then((movies) => {
        res.render("moviesList", { movies });
      })
      .catch((error) => {
        res.send(error);
      });
  },

  //Render de vista de lista de series
  series: (req, res) => {
    Product.findAll({ where: { type: "Serie de TV" } })
      .then((series) => {
        res.render("seriesList", { series });
      })
      .catch((error) => {
        res.send(error);
      });
  },

  //Render de vista de carrito
  cart: (req, res) => {
    res.render("productCart");
  },
};

module.exports = productController;
