//----------------------------------------------------------------------------//
// Note the use of validation middleware, and a centralized error handler. 
// To make the error handler useful for any error response (not just 500), we
// add a field to an Error object (statusCode). 
// 
// To make creating error objects with a status code property, we created an
// inherited error object (ExpressError).
//----------------------------------------------------------------------------//
const ExpressError = require('../ExpressError.js');
const express = require('express');

// Initially, we had the knex config in this file as a hard-coded object.
// We also imported knex, and created a configured instance of knex and used it
// directly in the endpoint handlers. 
// 
// The right pattern is to centralize the knex config data (see ./knexfile.js),
// and the configured instance of knex (see ./data/db-config.js). 
// 
// Then, we should have a model file (see ./api/fruits/fruits-model.js);
const Fruits = require('./fruits-model.js');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const fruits = await Fruits.get();
    res.status(200).json(fruits);
  } catch (err) {
    next(new ExpressError("error getting fruits: " + err.message, 500));
  }
});

router.get('/:id', validateId, async (req, res, next) => {
  try {
    res.status(200).json(req.fruit);
  } catch (err) {
    next(new ExpressError('error getting by id: ' + err.message, 500))
  }
});

router.post('/', validateBody, async (req, res, next) => {
  try {
    const newFruit = await Fruits.create(req.body);
    res.status(201).json(newFruit);
  } catch (err) {
    next(new ExpressError('error creating fruit: ' + err.message, 500));
  }
});

router.use((error, req, res) => {
  console.log('error: ', error);
  res.status(error.statusCode || 500).json({ message: error.message, error: error });
})

async function validateId(req, res, next) {
  try {
    const fruit = await Fruits.getById(req?.params?.id);

    if (fruit) {
      req.fruit = fruit;
      next();
    } else {
      next(new ExpressError('id not found', 404));
    }
  } catch (err) {
    next(new ExpressError('body validation error: ' + err.message, 500))
  }

}

async function validateBody(req, res, next) {
  const body = req.body;
  if (body.name && body.avgWeightOz) {
    next();
  } else {
    next(new ExpressError('name and avgWeightOz required', 400));
  }
}

module.exports = router;
