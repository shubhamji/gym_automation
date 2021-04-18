import '@lwc/synthetic-shadow';
import { createElement } from 'lwc';
import MyApp from 'my/app';

const app = createElement('my-app', { is: MyApp });
console.log(app);
// const express = require("express") 
// const session = require('express-session') 
// const appE = express() ;
// eslint-disable-next-line @lwc/lwc/no-document-query
document.querySelector('#main').appendChild(app);
