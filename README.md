# Functional Models Orm Rest Client

![Unit Tests](https://github.com/monolithst/functional-models-orm-rest-client/actions/workflows/ut.yml/badge.svg?branch=master)
![Feature Tests](https://github.com/monolithst/functional-models-orm-rest-client/actions/workflows/feature.yml/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/monolithst/functional-models-orm-rest-client/badge.svg?branch=master)](https://coveralls.io/github/monolithst/functional-models-orm-rest-client?branch=master)

A simple rest client for passing models from a front end to a backend, super seamlessly.


## A Simple Example (JS)
```
const { TextProperty } from 'functional-models'
const { orm } from 'functional-models-orm'
const { datastoreProvider } from 'functional-models-orm-rest-client'

// Step 1: Create the provider
const restDatastoreProvider = datastoreProvider() // All defaults

// Step 2: Create the orm with the provider
const myOrm = orm({ datastoreProvider })

// Step 3: Use the base model from the orm.
const Cars = myOrm.BaseModel('Cars', {
  properties: {
    color: TextProperty({ required: true })
  }
})

// Step 4: Use Models like normal 
const instance1 = Cars.create({ id: 'black-car-id', color: 'black' })

await instance1.save()
// POST /api/cars/black-car   { "id": "black-car-id", "color": "black" }

const instance2 = Cars.retrieve('black-car')
// GET /api/cars/black-car/black-car-id   
console.log(instance2) 
/*
{
  id: 'black-car-id',
  color: 'black',
}
*/
```

## Authentication
It is highly recommended that you use the input override for the httpHeaderGetter, in order to insert authentication.
Creating your own method will allow you to insert JWT mechanics. This is an asynchronous function that is called. So if you
need to login first, then set a header you can do so.

## Custom API
You can customize how the api works. Take a look at the inputs/code for the datastoreProvider. You can change how the urls are built, which http methods are used, as well as how the headers are built.
